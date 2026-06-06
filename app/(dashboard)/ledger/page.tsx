"use client";

import { FileSearch, Filter, Download, Calendar, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";

/* ─── Dummy Ledger Entries ─── */
const ledgerEntries = [
  {
    id: "AUD-2026-0047",
    entity: "Meridian Cloud Services",
    type: "OPEX",
    amount: -12480.0,
    reconciled: true,
    date: "2026-06-06",
  },
  {
    id: "AUD-2026-0046",
    entity: "Series B Tranche — Goldman Sachs",
    type: "CAPITAL",
    amount: 500000.0,
    reconciled: true,
    date: "2026-06-04",
  },
  {
    id: "AUD-2026-0045",
    entity: "AWS Infrastructure — Q2 Settlement",
    type: "OPEX",
    amount: -8745.32,
    reconciled: true,
    date: "2026-06-03",
  },
  {
    id: "AUD-2026-0044",
    entity: "External Audit Fee — Deloitte LLP",
    type: "COMPLIANCE",
    amount: -34000.0,
    reconciled: false,
    date: "2026-06-01",
  },
  {
    id: "AUD-2026-0043",
    entity: "Quarterly Revenue Clearing",
    type: "REVENUE",
    amount: 285000.0,
    reconciled: true,
    date: "2026-05-31",
  },
  {
    id: "AUD-2026-0042",
    entity: "Legal Retainer — Baker McKenzie",
    type: "COMPLIANCE",
    amount: -18500.0,
    reconciled: false,
    date: "2026-05-28",
  },
];

export default function LedgerAuditPage() {
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("ApexLedger", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Certified Treasury Statement", 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

    // Table Headers
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Audit ID", 14, 50);
    doc.text("Entity", 50, 50);
    doc.text("Type", 120, 50);
    doc.text("Amount", 150, 50);
    doc.text("Status", 180, 50);

    // Line
    doc.setLineWidth(0.5);
    doc.line(14, 52, 196, 52);

    // Table Data
    let y = 60;
    ledgerEntries.forEach((entry) => {
      doc.text(entry.id, 14, y);

      // truncate entity name if too long
      const entityName = entry.entity.length > 25 ? entry.entity.substring(0, 25) + "..." : entry.entity;
      doc.text(entityName, 50, y);

      doc.text(entry.type, 120, y);

      const amountStr = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(entry.amount);
      doc.text(amountStr, 150, y);

      doc.text(entry.reconciled ? "Reconciled" : "Pending", 180, y);

      y += 10;
    });

    doc.save("ApexLedger-Statement.pdf");
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider hover:border-slate-300 dark:hover:border-zinc-700 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Download size={12} />
            Export Certified Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Entries", value: "1,247" },
          { label: "Reconciled", value: "1,203" },
          { label: "Pending Review", value: "44" },
          { label: "Audit Period", value: "Q2 2026" },
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

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSearch size={14} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-sans">
              Audit Entries
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <Calendar size={11} />
            May — Jun 2026
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-zinc-800/40">
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                  Audit ID
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                  Entity
                </th>
                <th className="px-5 py-2.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase hidden sm:table-cell">
                  Type
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
              {ledgerEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-slate-50 dark:border-zinc-800/20 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {entry.id}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
                    {entry.entity}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/50">
                      {entry.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 text-sm font-mono font-medium text-right ${entry.amount >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-zinc-300"
                      }`}
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Math.abs(entry.amount))}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${entry.reconciled
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                        }`}
                    >
                      {entry.reconciled ? "Reconciled" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-400 dark:text-zinc-500 text-right hidden md:table-cell">
                    {entry.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
            Showing 6 of 1,247 entries
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
