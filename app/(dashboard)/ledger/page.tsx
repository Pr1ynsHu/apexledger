import { createClient } from "@/lib/supabase";
import LedgerTable, { TransactionEntry } from "@/components/LedgerTable";
import { log } from "@/lib/logger";

export const revalidate = 0; // Enforce strict server separation


export default async function LedgerAuditPage() {
  let transactions: TransactionEntry[] = [];
  let stats = {
    totalEntries: 0,
    reconciled: 0,
    pendingReview: 0,
  };

  try {
    const supabase = await createClient();
    
    // Fetch directly from database for absolute Server/Client separation
    const { data, error } = await supabase
      .from("corporate_transfers")
      .select("id, amount, status, routing_number, recipient_name, created_at, account_id, corporate_bank_accounts(official_name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      // Map to expected LedgerTable shape
      transactions = data.map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.created_at).toLocaleDateString(),
        counterparty: tx.recipient_name || "Unknown Entity",
        category: "Transfer",
        amount: tx.amount,
        status: tx.status === "completed" ? "Settled" : "Pending",
        bankName: tx.corporate_bank_accounts?.official_name || "Unknown Node",
      }));

      const total = transactions.length;
      const cleared = transactions.filter(t => t.status === "Settled").length;
      const pending = total - cleared;

      stats = {
        totalEntries: total,
        reconciled: cleared,
        pendingReview: pending,
      };
    }
  } catch (err) {
    log.error("Failed to fetch server ledger data stream:", err);
  }

  return <LedgerTable transactions={transactions} stats={stats} />;
}