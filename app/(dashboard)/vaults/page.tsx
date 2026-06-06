import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import PlaidLinkButton from "@/components/PlaidLinkButton";
import BalanceSummaryCard from "@/components/BalanceSummaryCard";
import BankCardGrid from "@/components/BankCardGrid";
export const revalidate = 0; // Forces Next.js to fetch fresh data on every single page load
export default async function VaultsPage() {
    const supabase = await createClient();

    // 1. Authenticate cookie session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/sign-in");
    }

    const activeSessionUserId = user.id;

    // 2. Fetch directly from database for absolute Server/Client separation
    const { data: accounts, error: dbError } = await supabase
        .from("corporate_bank_accounts")
        .select("account_id, official_name, mask, current_balance");

    const connectedVaults = accounts || [];
    const totalLiquidity = connectedVaults.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const databaseFetchError = !!dbError;

    return (
        <main className="flex flex-1 flex-col p-8 md:p-12 gap-8 max-w-[1400px] w-full mx-auto min-h-screen bg-transparent text-slate-900 dark:text-zinc-50 animate-fade-in">
            {/* Header Module */}
            <header className="flex items-start justify-between gap-6 border-b border-slate-200 dark:border-zinc-800 pb-6 w-full max-md:flex-col">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 md:text-3xl font-sans">
                        Asset Vault Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        Review cryptographic security clearings and institutional treasury reserves.
                    </p>
                </div>

                <div className="w-full md:w-[260px] shrink-0">
                    <PlaidLinkButton userId={activeSessionUserId} />
                </div>
            </header>

            {databaseFetchError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 font-mono">
                    System Warning: Could not establish a pipeline with the Plaid network ledger.
                </div>
            )}

            {/* Aggregated Analytics Banner Grid using LIVE Plaid Data */}
            {connectedVaults.length > 0 && (
                <div className="max-w-md w-full animate-fade-in">
                    <BalanceSummaryCard
                        totalCurrentBalance={totalLiquidity}
                        vaultCount={connectedVaults.length}
                    />
                </div>
            )}

            {/* Connected Repositories Section Heading */}
            <div className="flex flex-col gap-1 mt-2">
                <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-zinc-400 uppercase font-mono">
                    Connected Clearing Nodes
                </h2>
                <div className="h-px bg-slate-200 dark:bg-zinc-800/60 w-full mt-2" />
            </div>

            {/* Dynamic Card Layout Grid */}
            <BankCardGrid accounts={connectedVaults} />
        </main>
    );
}