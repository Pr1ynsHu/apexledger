import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// Instantiate configuration mapped to our exact .env.local environment variables
const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
    baseOptions: {
        headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
            "PLAID-SECRET": process.env.PLAID_SECRET,
        },
    },
});

// Export our unified type-safe execution client wrapper 
export const plaidClient = new PlaidApi(configuration);