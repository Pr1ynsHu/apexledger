"use server";

import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase";

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
                console.error(`Failed to sync vault ${bank.id} with Plaid:`, plaidError);
                // Continue the loop even if one specific bank node fails to respond
            }
        }

        return { success: true, totalLiquidity, vaults: activeVaults };

    } catch (error: any) {
        console.error("Critical failure fetching Plaid network data:", error);
        return { success: false, error: "Failed to establish Plaid network link." };
    }
}