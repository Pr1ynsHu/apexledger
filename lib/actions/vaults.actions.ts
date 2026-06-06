"use server";

import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";
import { revalidatePath } from "next/cache";

interface ExchangeTokenParams {
    publicToken: string;
    userId: string;
    institutionId: string;
    bankName: string;
}

export async function exchangePublicToken({
    publicToken,
    userId,
    institutionId,
    bankName,
}: ExchangeTokenParams) {
    try {
        // 1. Trade the temporary public token for a permanent institutional Access Token
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = exchangeResponse.data.access_token;

        // 2. Query Plaid's servers to pull down account sub-type details using our new access key
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0]; // Isolate the primary treasury checking account

        // 3. Connect to our secure Supabase PostgreSQL client cluster
        const supabase = await createClient();

        // 4. Record the fresh institutional link into our public.bank_accounts table safely
        const { error: dbError } = await supabase
            .from("bank_accounts")
            .insert({
                user_id: userId,
                account_id: accountData.account_id,
                bank_name: bankName,
                access_token: accessToken,
                sharable_id: `vault_sh_${Math.random().toString(36).substring(2, 11)}`,
            });

        if (dbError) throw new Error(`Vault ledger registration exception: ${dbError.message}`);

        // Revalidate the workspace layout to render new visual components instantly
        revalidatePath("/vaults");
        return { success: true };

    } catch (error: any) {
        log.error("Critical failure during public token clearance sequence:", error);
        return { success: false, error: error.message || "Failed to finalize asset connection handshake." };
    }
}