"use server";

import { plaidClient } from "@/lib/plaid";
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

        // 2. Transmit initialization handshake directly to Plaid infrastructure nodes
        const response = await plaidClient.linkTokenCreate(tokenConfigurations);

        return { success: true, linkToken: response.data.link_token };
    } catch (error: any) {
        console.error("Critical exception caught inside generateLinkToken processing block:", error);
        return { success: false, error: error.message || "Failed to clear institution allocation token." };
    }
}