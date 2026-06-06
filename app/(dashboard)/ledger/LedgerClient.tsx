"use client";

import { FileSearch, Filter, Download, Calendar, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";

export interface TransactionEntry {
  id: string;
  date: string;
  counterparty: string;
  category: string;
  amount: number;
  status: string;
  bankName: string;
}

interface LedgerClientProps {
  transactions: TransactionEntry[];
  stats: {
    totalEntries: number;
    reconciled: number;
    pendingReview: number;
  };
}

export default function LedgerClient({ transactions, stats }: LedgerClientProps) {
  const handleExportPDF = () => {
    if (transactions.length === 0) return;

    const doc = new jsPDF();

    // Clean Corporate Branding Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ApexLedger", 14, 24);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Certified Treasury Statement — Audit Trail", 14, 32);
    doc.text(`Generated Timestamp: ${new Date().toLocaleString()}`, 14, 38);

    // Section Line Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 44, 196, 44);

    // Grid Column Typography Headers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("SETTLEMENT ID", 14, 54);
    doc.text("NODE / INSTITUTION", 52, 54);
    doc.text("COUNTERPARTY DESTINATION", 92, 54);
    doc.text("STATUS", 154, 54);
    doc.text("AMOUNT", 196, 54, { align: "right" });

    // Header Bottom Line
    doc.line(14, 58, 196, 58);

    // Hydrate Dynamic Transaction Rows
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    let y = 66;
    transactions.forEach((entry) => {
      // Monitor page-boundary height extensions to handle multi-page layout wrapping safely
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      // Populate Column Parameters
      doc.text(entry.id.substring(0, 16) + "...", 14, y);
      doc.text(entry.bankName.toUpperCase(), 52, y);

      const counterpartyTrunc = entry.counterparty.length > 28 ? entry.counterparty.substring(0, 26) + "..." : entry.counterparty;
      doc.text(counterpartyTrunc, 92, y);

      doc.text(entry.status, 154, y);

      const isDebit = entry.amount > 0;
      const formattedAmount = `${isDebit ? "-" : "+"}${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(entry.amount))}`;
      doc.text(formattedAmount, 196, y, { align: "right" });

      y += 10;
    });

    doc.save(`ApexLedger-AuditStatement-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
            Ledger Audit Trail
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500">
            Immutable transaction records with reconciliation status tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.99] cursor-pointer">
            <Filter size={12} />
            Filter
          </button>
          <button
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.99] disabled:opacity-40 cursor-pointer"
          >
            <Download size={12} />
            Export Certified Statement
          </button>
        </div>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Ingested Entries", value: stats.totalEntries },
          { label: "Fully Reconciled", value: stats.reconciled },
          { label: "Pending Verification", value: stats.pendingReview },
          { label: "Current Audit Period", value: "Live Sync" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 p-3.5"
          >
            <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-zinc-600 uppercase block mb-1.5">
              {stat.label}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono leading-none">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Real-time Ledger Grid Table Component Layout */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSearch size={14} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-sans">
              Live Audit Entries
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <Calendar size={11} />
            Real-Time Accounting
          </div>
        </div>

        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-zinc-800/40">
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Settlement ID
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Node
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Counterparty
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase text-right">
                    Amount
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase text-right hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((entry) => {
                  const isDebit = entry.amount > 0;
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-50 dark:border-zinc-800/20 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3 text-xs font-mono text-slate-400 dark:text-zinc-500">
                        {entry.id.substring(0, 12)}...
                      </td>
                      <td className="px-5 py-3 text-xs font-mono font-bold tracking-wide text-slate-500 dark:text-zinc-400 uppercase">
                        {entry.bankName}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {entry.counterparty}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/50">
                          {entry.category}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 text-sm font-mono font-bold text-right ${isDebit ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                      >
                        {isDebit ? "-" : "+"}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Math.abs(entry.amount))}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${entry.status === "Cleared"
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                            : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                            }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-slate-400 dark:text-zinc-500 text-right hidden md:table-cell">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="w-full py-12 text-center text-xs font-mono text-slate-400 dark:text-zinc-500">
              No real-time clearings found. Link a financial vault node to stream live ledger data.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
            Showing {transactions.length} entries
          </span>
          <button className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer">
            Load More
            <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
