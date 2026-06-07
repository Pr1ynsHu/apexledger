"use server";

import Stripe from "stripe";
import { createClient } from "../supabase";
import { revalidatePath } from "next/cache";
import { log } from "../logger";

// ─── Stripe Sandbox Client ───
// Initialised at module scope so the SDK connection is reused across
// invocations within the same server-side worker (cold-start once).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
});
const STRIPE_TEST_DESTINATION_ACCOUNT = "acct_1TfjV6HSKZNt4A05";

interface InitiateTransferParams {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    memo: string;
    idempotencyKey: string;
    transactionType?: "internal" | "outbound" | "inbound";
    externalRoutingNumber?: string;
    externalAccountNumber?: string;
    beneficiaryName?: string;
    category?: string;
    transactionScope?: "opex" | "treasury";
}

export async function initiateTreasuryTransfer({
    sourceAccountId,
    destinationAccountId,
    amount,
    memo,
    idempotencyKey,
    transactionType = "internal",
    externalRoutingNumber,
    externalAccountNumber,
    beneficiaryName,
    category,
    transactionScope,
}: InitiateTransferParams) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            log.error("Transfer unauthorized", { reason: "Missing active session context" });
            await log.flush();
            throw new Error("Authentication required to execute outbound clearings.");
        }

        log.info("Treasury pipeline routing handshake triggered", {
            userId: user.id,
            amount,
            transactionType,
            idempotencyKey,
        });

        let networkTransactionId = `sim_${idempotencyKey}`;
        let transferStatus = "settled";

        // ─── Balance Validation (Internal & Outbound Only) ───
        if (transactionType === "internal" || transactionType === "outbound") {
            const { data: sourceAccount, error: accError } = await supabase
                .from("corporate_bank_accounts")
                .select("current_balance")
                .eq("account_id", sourceAccountId)
                .single();

            if (accError || !sourceAccount) {
                log.error("Liquidity validation failed", accError, { accountId: sourceAccountId });
                await log.flush();
                throw new Error("Unable to parse available clearing balances from source asset.");
            }

            if (sourceAccount.current_balance < amount) {
                log.warn("Transfer rejected due to asset deficiency", {
                    available: sourceAccount.current_balance,
                    requested: amount,
                });
                await log.flush();
                throw new Error("Insufficient clearings available within designated liquidity node.");
            }
        }

        // ─── Stripe Sandbox Transfer (Outbound Only) ───
        if (transactionType === "outbound") {
            const amountInCents = Math.round(amount * 100);

            log.info("Initiating Stripe sandbox transfer", {
                amountCents: amountInCents,
                destination: STRIPE_TEST_DESTINATION_ACCOUNT,
                idempotencyKey,
            });

            const payout = await stripe.payouts.create({
                amount: amountInCents, // Convert the input dollars to cents
                currency: 'usd',
                description: `Outbound payout to ${beneficiaryName || 'External Beneficiary'}`,
                destination: 'btok_us_verified',
                metadata: {
                    transaction_type: 'outbound',
                    beneficiary_name: beneficiaryName || 'External Beneficiary'
                }
            });

            networkTransactionId = payout.id;
            transferStatus = payout.status || 'pending';

            log.info("Stripe sandbox payout completed", {
                payoutId: payout.id,
                amountCents: payout.amount,
                status: payout.status,
            });
        } else if (transactionType === "inbound") {
            // ─── Inbound Deposit ───
            const amountInCents = Math.round(Number(amount) * 100);

            log.info("Simulated inbound deposit accepted", {
                sender: sourceAccountId,
                destinationNode: destinationAccountId,
                amountCents: amountInCents,
            });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                payment_method: 'pm_card_bypassPending',
                confirm: true,
                automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
                metadata: {
                    transaction_type: 'inbound',
                    beneficiary_name: sourceAccountId || 'External Depositor'
                }
            });

            networkTransactionId = paymentIntent.id;

            log.info("Stripe sandbox payment intent completed", {
                paymentIntentId: paymentIntent.id,
                amountCents: paymentIntent.amount,
                status: paymentIntent.status,
            });
        } else {
            // ─── Internal Transfer ───
            log.info("Internal vault transfer processed", {
                source: sourceAccountId,
                destination: destinationAccountId,
                amount,
            });
        }

        // ─── Supabase Ledger Insert ───
        // Insert transaction row into corporate transfers log table,
        // now enriched with the Stripe network transaction ID.
        const { data: transferRecord, error: dbError } = await supabase
            .from("corporate_transfers")
            .insert([
                {
                    user_id: user.id,
                    source_account_id: sourceAccountId,
                    destination_account_id: transactionType === "outbound" ? null : destinationAccountId,
                    amount,
                    reference_memo: memo || (transactionType === "inbound" ? "Inbound client deposit" : "Inter-account capital optimization clearings"),
                    status: transferStatus,
                    idempotency_key: idempotencyKey,
                    network_transaction_id: networkTransactionId,
                    transaction_type: transactionType,
                    external_routing_number: externalRoutingNumber,
                    external_account_number: externalAccountNumber,
                    beneficiary_name: beneficiaryName,
                    category: category,
                    transaction_scope: transactionScope,
                },
            ])
            .select()
            .single();

        if (dbError) {
            if (dbError.code === "23505") {
                log.warn("Idempotent transfer intercept block triggered", { idempotencyKey });
                await log.flush();
                throw new Error("A clearing request matching this token transaction signature is already processing.");
            }
            throw dbError;
        }

        log.info("Treasury clearings row committed safely to database", {
            transferId: transferRecord.id,
            networkTransactionId,
            transactionType,
            status: "settled",
        });

        await log.flush();

        revalidatePath("/ledger");
        revalidatePath("/dashboard");
        revalidatePath("/");

        return { success: true, transfer: transferRecord };

    } catch (error: any) {
        // Pass the raw error parameter cleanly into your updated logger signature
        log.error("Critical failure during treasury transaction compilation", error);
        await log.flush();

        return { success: false, error: error?.message || "Internal database ledger error." };
    }
}

// ─── Auto-Sync Logic for Polling Alternative ───
export async function syncPendingStripeTransfers() {
    const supabase = await createClient();
    try {
        const { data: userRecord, error: authError } = await supabase.auth.getUser();
        if (authError || !userRecord?.user) return; // Silent abort if not logged in

        const { data: pendingTransfers, error } = await supabase
            .from("corporate_transfers")
            .select("id, network_transaction_id, transaction_type")
            .eq("status", "pending")
            .not("network_transaction_id", "is", null);

        if (error || !pendingTransfers || pendingTransfers.length === 0) return;

        for (const tx of pendingTransfers) {
            if (tx.network_transaction_id.startsWith("po_")) {
                const payout = await stripe.payouts.retrieve(tx.network_transaction_id);
                if (payout.status === 'paid' || payout.status === 'canceled' || payout.status === 'failed') {
                    const newStatus = payout.status === 'paid' ? 'settled' : 'failed';
                    await supabase.rpc('update_transfer_status_by_network_id', {
                        network_id: tx.network_transaction_id,
                        new_status: newStatus
                    });
                }
            } else if (tx.network_transaction_id.startsWith("pi_")) {
                const pi = await stripe.paymentIntents.retrieve(tx.network_transaction_id);
                if (pi.status === 'succeeded' || pi.status === 'canceled') {
                    const newStatus = pi.status === 'succeeded' ? 'settled' : 'failed';
                    await supabase.rpc('update_transfer_status_by_network_id', {
                        network_id: tx.network_transaction_id,
                        new_status: newStatus
                    });
                }
            }
        }
    } catch (error) {
        log.error("Failed to sync pending Stripe transfers", error);
    }
}