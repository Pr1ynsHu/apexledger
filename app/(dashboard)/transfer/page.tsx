import {
  ArrowUpRight,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

/* ─── Dummy Routing Queue ─── */
const routingQueue = [
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
  return (
    <div className="space-y-6 animate-fade-in">
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
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-medium transition-all active:scale-[0.99] cursor-pointer">
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
            {routingQueue.length} transfers
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/30">
          {routingQueue.map((transfer) => {
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
    </div>
  );
}
