"use server";

import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase";
import { log } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { Products, CountryCode } from "plaid";

interface LinkTokenParams {
    userId: string;
    clientName: string;
}

export async function generateLinkToken({ userId, clientName }: LinkTokenParams) {
    try {
        const productsArray = process.env.PLAID_PRODUCTS
            ? process.env.PLAID_PRODUCTS.split(",").map(p => p.trim())
            : ["auth"];

        const countryCodesArray = process.env.PLAID_COUNTRY_CODES
            ? process.env.PLAID_COUNTRY_CODES.split(",").map(c => c.trim())
            : ["US"];

        const tokenConfigurations = {
            user: {
                client_user_id: userId,
            },
            client_name: clientName,
            products: productsArray as Products[],
            country_codes: countryCodesArray as CountryCode[],
            language: "en",
        };

        const response = await plaidClient.linkTokenCreate(tokenConfigurations);

        return { success: true, linkToken: response.data.link_token };
    } catch (error: any) {
        log.error("Critical exception caught inside generateLinkToken processing block:", error);
        return { success: false, error: error.message || "Failed to clear institution allocation token." };
    }
}

interface ExchangeTokenParams {
    publicToken: string;
    institutionName: string;
    userId: string;
}

export async function exchangePublicToken({ publicToken, institutionName, userId }: ExchangeTokenParams) {
    try {
        // 1. Swap the frontend public token for a permanent institutional access token via Plaid API
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = tokenResponse.data.access_token;
        const itemId = tokenResponse.data.item_id;

        // 2. Query Plaid immediately to extract the specific base account metadata ID identifier
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });
        const primaryAccountId = accountsResponse.data.accounts[0]?.account_id || "acct_unknown";

        // 3. Open a server-side client connection to your Supabase PostgreSQL engine
        const supabase = await createClient();

        // 4. Safely insert the encrypted banking credentials mapped to our authenticated user profile
        const { error: dbError } = await supabase
            .from("bank_accounts")
            .insert({
                user_id: userId,
                access_token: accessToken,
                item_id: itemId,
                bank_name: institutionName,
                account_id: primaryAccountId
            });

        if (dbError) throw new Error(`Database clearing log failure: ${dbError.message}`);

        // 5. Purge the Next.js routing cache so the new node appears on your screen instantly
        revalidatePath("/vaults");

        return { success: true };
    } catch (error: any) {
        log.error("Critical failure during public token clearance processing:", error);
        return { success: false, error: error.message || "Failed to save secure banking vault channel." };
    }
}