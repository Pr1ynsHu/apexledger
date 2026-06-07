"use client";

import { FileSearch, Filter, Download, Calendar, ChevronRight, Search } from "lucide-react";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface TransactionEntry {
  id: string;
  date: string;
  counterparty: string;
  category: string;
  amount: number;
  status: string;
  bankName: string;
}

interface LedgerTableProps {
  transactions: TransactionEntry[];
  stats: {
    totalEntries: number;
    reconciled: number;
    pendingReview: number;
  };
}

export default function LedgerTable({ transactions, stats }: LedgerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [nodeFilter, setNodeFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();
  const [transactionType, setTransactionType] = useState<string>('ALL'); // ALL, CREDIT, DEBIT
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const setQuarter = (q: number) => {
    const year = new Date().getFullYear();
    let from, to;
    if (q === 1) { from = new Date(year, 0, 1); to = new Date(year, 2, 31); }
    else if (q === 2) { from = new Date(year, 3, 1); to = new Date(year, 5, 30); }
    else if (q === 3) { from = new Date(year, 6, 1); to = new Date(year, 8, 30); }
    else if (q === 4) { from = new Date(year, 9, 1); to = new Date(year, 11, 31); }
    if (from && to) {
      setDateRange({ from, to });
    }
  };

  const filteredData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.bankName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter && statusFilter !== 'ALL' 
        ? tx.status.toUpperCase() === statusFilter 
        : true;
        
      const matchesNode = nodeFilter && nodeFilter !== 'ALL' 
        ? tx.bankName.toUpperCase() === nodeFilter 
        : true;

      // Type Filter
      let matchesType = true;
      if (transactionType === 'CREDIT') matchesType = tx.amount > 0;
      else if (transactionType === 'DEBIT') matchesType = tx.amount < 0;

      // Amount Range Filter
      let matchesAmount = true;
      const absAmount = Math.abs(tx.amount);
      if (amountRange.min !== '') matchesAmount = matchesAmount && absAmount >= Number(amountRange.min);
      if (amountRange.max !== '') matchesAmount = matchesAmount && absAmount <= Number(amountRange.max);

      // Date Range Filter
      let matchesDate = true;
      if (dateRange?.from) {
        const txDate = new Date((tx as any).created_at || tx.date);
        txDate.setHours(0,0,0,0);
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0,0,0,0);
          matchesDate = matchesDate && txDate >= fromDate;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23,59,59,999);
          matchesDate = matchesDate && txDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesNode && matchesType && matchesAmount && matchesDate;
    });
  }, [transactions, searchQuery, statusFilter, nodeFilter, transactionType, amountRange, dateRange]);

  const displayedData = filteredData.slice(0, visibleCount);

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

      const isDebit = entry.amount < 0;
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
          <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              suppressHydrationWarning={true}
              type="text"
              placeholder="Search references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[160px] md:w-[200px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3 text-xs font-mono text-slate-600 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button suppressHydrationWarning={true} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.99] cursor-pointer">
                <Filter size={12} />
                Advanced Filters
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">Filter Transactions</h4>
                
                {/* Date Filters */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Timeframe (Quarter)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(q => (
                      <button key={q} onClick={() => setQuarter(q)} className="flex-1 py-1.5 px-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                        Q{q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Custom Date Range</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      className="flex-1 text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500"
                      value={dateRange?.from ? dateRange.from.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                    />
                    <input 
                      type="date" 
                      className="flex-1 text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500"
                      value={dateRange?.to ? dateRange.to.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                    />
                  </div>
                </div>

                {/* Amount Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Amount Range (USD)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="flex-1 text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500"
                      value={amountRange.min}
                      onChange={e => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="flex-1 text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500"
                      value={amountRange.max}
                      onChange={e => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Status & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</label>
                    <select 
                      className="w-full text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-zinc-100"
                      value={statusFilter || 'ALL'}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SETTLED">Settled</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Type</label>
                    <select 
                      className="w-full text-xs p-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-zinc-100"
                      value={transactionType}
                      onChange={e => setTransactionType(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="CREDIT">Inbound (Credit)</option>
                      <option value="DEBIT">Outbound (Debit)</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setDateRange(undefined);
                    setStatusFilter('ALL');
                    setTransactionType('ALL');
                    setAmountRange({ min: '', max: '' });
                  }}
                  className="w-full py-2.5 mt-2 text-xs font-semibold border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <button
            suppressHydrationWarning={true}
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
          {displayedData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-zinc-800/40 hover:bg-transparent">
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Settlement ID
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Node
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">
                    Counterparty
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase hidden sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase hidden md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-600 uppercase text-right hidden md:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedData.map((entry) => {
                  const isDebit = entry.amount < 0;
                  return (
                    <TableRow
                      key={entry.id}
                      onClick={() => setSelectedTx(entry)}
                      className="border-b border-slate-50 dark:border-zinc-800/20 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                    >
                      <TableCell className="py-3 text-xs font-mono text-slate-400 dark:text-zinc-500">
                        {entry.id.startsWith("pi_") || entry.id.startsWith("tr_")
                          ? entry.id.substring(0, 24) + (entry.id.length > 24 ? "…" : "")
                          : entry.id.substring(0, 8) + "…"}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono font-bold tracking-wide text-slate-500 dark:text-zinc-400 uppercase">
                        {entry.bankName}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {entry.counterparty}
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/50">
                          {entry.category}
                        </span>
                      </TableCell>
                      <TableCell
                        suppressHydrationWarning
                        className={`py-3 text-sm font-mono font-bold text-right ${isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {isDebit ? "-" : "+"}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Math.abs(entry.amount))}
                      </TableCell>
                      <TableCell className="py-3 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${entry.status === "Settled"
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10"
                            : "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-500/10"
                            }`}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell suppressHydrationWarning className="py-3 text-xs font-mono text-slate-400 dark:text-zinc-500 text-right hidden md:table-cell">
                        {entry.date}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="w-full py-12 text-center text-xs font-mono text-slate-400 dark:text-zinc-500">
              No real-time clearings found. Link a financial vault node to stream live ledger data.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
            Showing {displayedData.length} of {filteredData.length} entries
          </span>
          {visibleCount < filteredData.length && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)} 
              suppressHydrationWarning={true} 
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer"
            >
              Load More
              <ChevronRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Details Slide-out Sheet */}
      <Sheet open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              View complete immutable audit record for this ledger entry.
            </SheetDescription>
          </SheetHeader>
          
          {selectedTx && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Settlement ID</p>
                <p className="text-sm font-mono text-slate-900 dark:text-zinc-100">{selectedTx.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Timestamp</p>
                <p className="text-sm font-sans text-slate-900 dark:text-zinc-100">
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(selectedTx.created_at || selectedTx.date))}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Node / Institution</p>
                <p className="text-sm font-sans font-medium text-slate-900 dark:text-zinc-100">{selectedTx.bankName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Counterparty Destination</p>
                <p className="text-sm font-sans text-slate-900 dark:text-zinc-100">{selectedTx.counterparty}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Category</p>
                <Badge variant="secondary" className="font-mono text-[10px] tracking-wider uppercase mt-1">
                  {selectedTx.category}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider mt-1 ${selectedTx.status === "Settled"
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10"
                    : "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-500/10"
                    }`}
                >
                  {selectedTx.status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Net Settlement Amount</p>
                <p className={`text-2xl font-mono font-bold mt-1 ${selectedTx.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {selectedTx.amount < 0 ? "-" : "+"}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Math.abs(selectedTx.amount))}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
