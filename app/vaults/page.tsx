import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { getInstitutionalBalances } from "@/lib/actions/bank.actions";
import PlaidLinkButton from "@/components/PlaidLinkButton";
import AssetVaultCard from "@/components/AssetVaultCard";
import BalanceSummaryCard from "@/components/BalanceSummaryCard";

export default async function VaultsPage() {
    const supabase = await createClient();

    // 1. Authenticate cookie session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/sign-in");
    }

    const activeSessionUserId = user.id;

    // 2. Execute real-time Plaid data pipeline fetch
    const networkResponse = await getInstitutionalBalances({ userId: activeSessionUserId });

    const connectedVaults = networkResponse?.vaults || [];
    const totalLiquidity = networkResponse?.totalLiquidity || 0;
    const databaseFetchError = networkResponse?.success === false;

    return (
        <main className="flex flex-1 flex-col p-8 md:p-12 gap-8 max-w-[1400px] w-full mx-auto min-h-screen bg-slate-950 text-slate-50">
            {/* Header Module */}
            <header className="flex items-start justify-between gap-6 border-b border-slate-800 pb-6 w-full max-md:flex-col">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl font-sans">
                        Asset Vault Management
                    </h1>
                    <p className="text-sm text-slate-400">
                        Review cryptographic security clearings and institutional treasury reserves.
                    </p>
                </div>

                <div className="w-full md:w-[260px] shrink-0">
                    <PlaidLinkButton userId={activeSessionUserId} />
                </div>
            </header>

            {databaseFetchError && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-400 font-mono">
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
                <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
                    Connected Clearing Nodes
                </h2>
                <div className="h-px bg-slate-800/60 w-full mt-2" />
            </div>

            {/* Dynamic Card Column Layout Matrix Grid using LIVE Plaid Data */}
            {connectedVaults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-start animate-fade-in">
                    {connectedVaults.map((vault: any) => (
                        <AssetVaultCard
                            key={vault.id}
                            bankName={vault.bankName}
                            accountName={vault.accountName}
                            mask={vault.mask}
                            sharableId={vault.sharableId}
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full p-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
                    <p className="text-sm font-medium text-slate-300">No institutional clearing channels connected.</p>
                    <p className="text-xs text-slate-500 max-w-[280px]">
                        Authorize an outbound link channel using the interface controller above to stream transactional ledger entries.
                    </p>
                </div>
            )}
        </main>
    );
}