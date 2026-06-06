"use server";

import { createClient } from "../supabase";
import { revalidatePath } from "next/cache";
import { log } from "../logger";

interface InitiateTransferParams {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    memo: string;
    idempotencyKey: string;
}

export async function initiateTreasuryTransfer({
    sourceAccountId,
    destinationAccountId,
    amount,
    memo,
    idempotencyKey,
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
            idempotencyKey,
        });

        // Fetch balance check from your table matching corporate accounts
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

        // Insert transaction row into corporate transfers log table
        const { data: transferRecord, error: dbError } = await supabase
            .from("corporate_transfers")
            .insert([
                {
                    user_id: user.id,
                    source_account_id: sourceAccountId,
                    destination_account_id: destinationAccountId,
                    amount,
                    reference_memo: memo || "Inter-account capital optimization clearings",
                    status: "pending",
                    idempotency_key: idempotencyKey,
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
            status: "pending_settlement",
        });

        await log.flush();

        revalidatePath("/ledger");
        revalidatePath("/dashboard");

        return { success: true, transfer: transferRecord };

    } catch (error: any) {
        // Pass the raw error parameter cleanly into your updated logger signature
        log.error("Critical failure during treasury transaction compilation", error);
        await log.flush();

        return { success: false, error: error?.message || "Internal database ledger error." };
    }
}