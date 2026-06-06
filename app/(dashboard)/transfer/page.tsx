"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
} from "lucide-react";

/* ─── Dummy Routing Queue ─── */
const initialRoutingQueue = [
  {
    id: "RTG-00128",
    recipient: "Meridian Cloud Services LLC",
    recipientBank: "JPMorgan Chase",
    amount: 12480.0,
    method: "ACH",
    status: "completed",
    initiatedAt: "2026-06-06T13:42:00Z",
  },
  {
    id: "RTG-00127",
    recipient: "Baker McKenzie LLP",
    recipientBank: "Citibank N.A.",
    amount: 18500.0,
    method: "WIRE",
    status: "processing",
    initiatedAt: "2026-06-06T11:20:00Z",
  },
  {
    id: "RTG-00126",
    recipient: "AWS Inc.",
    recipientBank: "Bank of America",
    amount: 8745.32,
    method: "ACH",
    status: "completed",
    initiatedAt: "2026-06-05T16:00:00Z",
  },
  {
    id: "RTG-00125",
    recipient: "Deloitte Touche Tohmatsu",
    recipientBank: "HSBC Holdings",
    amount: 34000.0,
    method: "WIRE",
    status: "failed",
    initiatedAt: "2026-06-05T09:30:00Z",
  },
  {
    id: "RTG-00124",
    recipient: "Oracle Corporation",
    recipientBank: "Wells Fargo",
    amount: 67200.0,
    method: "WIRE",
    status: "completed",
    initiatedAt: "2026-06-04T14:15:00Z",
  },
];

const statusConfig = {
  completed: {
    label: "Settled",
    icon: CheckCircle2,
    classes: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  },
  processing: {
    label: "In Transit",
    icon: Clock,
    classes: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    classes: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  },
} as const;

export default function TransferPage() {
  const [queue, setQueue] = useState(initialRoutingQueue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    recipientBank: "",
    amount: "",
    method: "ACH",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate delay
    setTimeout(() => {
      const newTx = {
        id: `RTG-00${Math.floor(Math.random() * 900) + 100}`,
        recipient: formData.recipient,
        recipientBank: formData.recipientBank,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: "processing",
        initiatedAt: new Date().toISOString(),
      };
      setQueue([newTx, ...queue]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFormData({ recipient: "", recipientBank: "", amount: "", method: "ACH" });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 font-sans tracking-tight">
            Outbound Treasury Routing
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500">
            Manage disbursements, wire transfers, and ACH settlement queues.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-medium transition-all active:scale-[0.99] cursor-pointer"
        >
          <Send size={14} />
          Initiate Transfer
        </button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Routed (30D)", value: "$482,925" },
          { label: "In Transit", value: "1" },
          { label: "Failed", value: "1" },
          { label: "Success Rate", value: "97.8%" },
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

      {/* Routing Queue */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-sans">
              Routing Queue
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            {queue.length} transfers
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/30">
          {queue.map((transfer) => {
            const status = statusConfig[transfer.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <div
                key={transfer.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center shrink-0">
                  <Building2 size={15} className="text-slate-400 dark:text-zinc-500" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {transfer.recipient}
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-zinc-600 uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/50 shrink-0">
                      {transfer.method}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
                    <span className="font-mono">{transfer.id}</span>
                    <span>·</span>
                    <span>{transfer.recipientBank}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline font-mono">
                      {new Date(transfer.initiatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(transfer.amount)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 hidden sm:block">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-1 rounded-full ${status.classes}`}
                  >
                    <StatusIcon size={10} />
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Initiate Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800/60">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Initiate Transfer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInitiate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">Recipient</label>
                <input required type="text" value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">Recipient Bank</label>
                <input required type="text" value={formData.recipientBank} onChange={e => setFormData({...formData, recipientBank: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="e.g. Chase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">Amount (USD)</label>
                  <input required type="number" min="1" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase mb-1.5">Method</label>
                  <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 outline-none">
                    <option value="ACH">ACH</option>
                    <option value="WIRE">WIRE</option>
                    <option value="SWIFT">SWIFT</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center">
                  {isSubmitting ? <span className="animate-pulse">Authorizing...</span> : "Authorize Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
