import { getInstitutionalTransactions } from "@/lib/actions/bank.actions";
import LedgerClient, { TransactionEntry } from "./LedgerClient";

export const dynamic = "force-dynamic";

export default async function LedgerAuditPage() {
  let transactions: TransactionEntry[] = [];
  let stats = {
    totalEntries: 0,
    reconciled: 0,
    pendingReview: 0,
  };

  try {
    const response = await getInstitutionalTransactions();
    if (response?.success && response.transactions) {
      transactions = response.transactions;

      const total = response.transactions.length;
      const cleared = response.transactions.filter((tx: any) => tx.status === "Cleared").length;
      const pending = total - cleared;

      stats = {
        totalEntries: total,
        reconciled: cleared,
        pendingReview: pending,
      };
    }
  } catch (err) {
    console.error("Failed to sync server ledger data stream:", err);
  }

  return <LedgerClient transactions={transactions} stats={stats} />;
}