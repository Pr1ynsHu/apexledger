export const dynamic = "force-dynamic";
export const revalidate = 0; // Enforce strict server separation

import { createClient } from "@/lib/supabase";
import LedgerTable, { TransactionEntry } from "@/components/LedgerTable";
import { log } from "@/lib/logger";

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
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      // Generate double-entry ledger mapping
      transactions = data.flatMap((tx: any) => {
        const baseTx = {
          id: tx.network_transaction_id || tx.id || "Unknown ID",
          date: new Date(tx.created_at).toISOString().split('T')[0],
          category: tx.reference_memo || "Transfer",
          status: tx.status ? (tx.status.charAt(0).toUpperCase() + tx.status.slice(1)) : "Pending",
          created_at: tx.created_at,
        };

        // 1. Internal Vault Transfers (Generate both Debit and Credit pairs)
        if (tx.transaction_type === 'internal' || !tx.transaction_type) {
          return [
            {
              ...baseTx,
              id: `${baseTx.id}-out`,
              amount: -(tx.amount || 0),
              bankName: tx.source_account_id || "Unknown Node",
              counterparty: tx.destination_account_id || "Internal Node",
            },
            {
              ...baseTx,
              id: `${baseTx.id}-in`,
              amount: (tx.amount || 0),
              bankName: tx.destination_account_id || "Unknown Node",
              counterparty: tx.source_account_id || "Unknown Node",
            }
          ];
        }

        // 2. Outbound Payouts to External Entities (Generate ONLY a single Debit row)
        if (tx.transaction_type === 'outbound') {
          return [
            {
              ...baseTx,
              id: `${baseTx.id}-out`,
              amount: -(tx.amount || 0),
              bankName: tx.source_account_id || "Unknown Node",
              counterparty: tx.beneficiary_name || "External Beneficiary",
            }
          ];
        }

        // 3. Inbound Deposits from Third Parties (Generate ONLY a single Credit row)
        if (tx.transaction_type === 'inbound') {
          return [
            {
              ...baseTx,
              id: `${baseTx.id}-in`,
              amount: (tx.amount || 0),
              bankName: tx.destination_account_id || "Unknown Node",
              counterparty: tx.beneficiary_name || tx.source_account_id || "External Sender",
            }
          ];
        }

        return [];
      }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const total = data.length;
      const cleared = data.filter((t: any) => t.status?.toLowerCase() === "settled").length;
      const pending = data.filter((t: any) => t.status?.toLowerCase() === "pending").length;

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