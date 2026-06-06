"use server";

import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";

export async function getInstitutionalBalances({ userId }: { userId: string }) {
    try {
        const supabase = await createClient();

        // 1. Fetch all securely stored access tokens for this user's accounts
        const { data: banks, error } = await supabase
            .from("bank_accounts")
            .select("*")
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
        if (!banks || banks.length === 0) return { success: true, totalLiquidity: 0, vaults: [] };

        let totalLiquidity = 0;
        const activeVaults = [];

        // 2. Loop through each connection and query Plaid for real-time network data
        for (const bank of banks) {
            try {
                const accountsResponse = await plaidClient.accountsGet({
                    access_token: bank.access_token,
                });

                const accountData = accountsResponse.data.accounts[0];

                // Plaid returns live balances. We default to 0 if the API lags.
                const currentBalance = accountData.balances.current || 0;
                totalLiquidity += currentBalance;

                activeVaults.push({
                    id: bank.id,
                    bankName: bank.bank_name,
                    accountName: accountData.name || "Corporate Treasury",
                    mask: accountData.mask || "0000",
                    balance: currentBalance,
                    sharableId: bank.sharable_id,
                });
            } catch (plaidError) {
                log.error(`Failed to sync vault ${bank.id} with Plaid:`, plaidError);
                // Continue the loop even if one specific bank node fails to respond
            }
        }

        return { success: true, totalLiquidity, vaults: activeVaults };

    } catch (error: any) {
        log.error("Critical failure fetching Plaid network data:", error);
        return { success: false, error: "Failed to establish Plaid network link." };
    }
}
export async function getInstitutionalTransactions({ userId }: { userId?: string } = {}) {
    try {
        const supabase = await createClient();

        let targetUserId = userId;
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: true, transactions: [] };
            targetUserId = user.id;
        }

        // 1. Locate the active bank tokens for this explicit user session
        const { data: banks, error } = await supabase
            .from("bank_accounts")
            .select("*")
            .eq("user_id", targetUserId);

        if (error) throw new Error(error.message);
        if (!banks || banks.length === 0) return { success: true, transactions: [] };

        let aggregatedTransactions: any[] = [];

        // 2. Query Plaid for the past 30 days of corporate clearing records
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = now.toISOString().split('T')[0];

        for (const bank of banks) {
            try {
                const transactionResponse = await plaidClient.transactionsGet({
                    access_token: bank.access_token,
                    start_date: startDate,
                    end_date: endDate,
                    options: { count: 12 } // Return a modern high-density ledger view snippet
                });

                const structuralRecords = transactionResponse.data.transactions.map((tx) => ({
                    id: tx.transaction_id,
                    date: tx.date,
                    counterparty: tx.merchant_name || tx.name,
                    category: tx.category ? tx.category[0] : "Operational",
                    amount: tx.amount,
                    status: tx.pending ? "Pending" : "Cleared",
                    bankName: bank.bank_name
                }));

                aggregatedTransactions = [...aggregatedTransactions, ...structuralRecords];
            } catch (err) {
                log.error(`Skipping transaction node sync execution for vault ${bank.id}:`, err);
            }
        }

        // Sort the dynamic output stream chronologically (newest first)
        return {
            success: true,
            transactions: aggregatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };

    } catch (error: any) {
        log.error("Critical failure streaming transaction matrices:", error);
        return { success: false, error: "System synchronization failure with Plaid ledger nodes." };
    }
}