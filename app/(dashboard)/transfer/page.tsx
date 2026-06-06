"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Landmark, Coins, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { initiateTreasuryTransfer } from "@/lib/actions/transfers.actions";
import { createClient } from "@/lib/supabaseClient"; // adjust if needed based on path alias configuration

interface BankAccount {
  account_id: string;
  official_name: string;
  current_balance: number;
  mask: string;
}

export default function TransferPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form State Containers
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  // Status UX States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load connected corporate bank account variables on runtime mount
  useEffect(() => {
    async function fetchLiquidityNodes() {
      try {
        // 🚀 THE FIX: Add 'await' to resolve the Supabase Client promise
        const supabase = await createClient();

        const { data, error } = await supabase
          .from("corporate_bank_accounts")
          .select("account_id, official_name, current_balance, mask");

        if (!error && data) {
          setAccounts(data);
          if (data.length > 0) setSourceId(data[0].account_id);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    fetchLiquidityNodes();
  }, []);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destinationId || !amount || isSubmitting) return;
    if (sourceId === destinationId) {
      setStatusMessage({ type: "error", text: "Source and destination liquidity nodes cannot be identical." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // 🚀 Generate a unique idempotency key to pass to the database block to capture click double-submits
    const uniqueIdempotencySignature = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const result = await initiateTreasuryTransfer({
        sourceAccountId: sourceId,
        destinationAccountId: destinationId,
        amount: parseFloat(amount),
        memo: memo,
        idempotencyKey: uniqueIdempotencySignature,
      });

      if (result.success) {
        setStatusMessage({ type: "success", text: "Treasury transaction routing confirmed. Settlement row pending." });
        setAmount("");
        setMemo("");
        // Refresh and push user down to the ledger overview grid to watch the row populate
        setTimeout(() => {
          router.push("/ledger");
        }, 1500);
      } else {
        setStatusMessage({ type: "error", text: result.error || "Internal compilation failure." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Network connection timeout during handshake execution." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAccounts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-mono text-xs uppercase gap-2">
        <Loader2 className="animate-spin text-emerald-500" size={18} />
        Synchronizing internal liquidity parameters...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title Header Viewport */}
      <div>
        <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <ArrowRightLeft className="text-emerald-500" size={20} />
          Capital Routing Center
        </h1>
        <p className="text-xs text-slate-400 font-mono uppercase mt-1">
          Authorized Inter-Account Outbound Clearing Engine
        </p>
      </div>

      <form onSubmit={handleTransferSubmit} className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm space-y-5">
        {/* 1. Source Account Node Selection Menu */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Landmark size={14} className="text-slate-400" /> Origin Liquidity Node (Debit Source)
          </label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
          >
            {accounts.map((acc) => (
              <option key={acc.account_id} value={acc.account_id}>
                {acc.official_name} (•••• {acc.mask}) — ${acc.current_balance.toLocaleString()} USD
              </option>
            ))}
          </select>
        </div>

        {/* 2. Destination Account Node Selection Menu */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Landmark size={14} className="text-slate-400" /> Target Vault Allocation Node (Credit Destination)
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
          >
            <option value="" disabled>Select target routing vault account...</option>
            {accounts.map((acc) => (
              <option key={acc.account_id} value={acc.account_id}>
                {acc.official_name} (•••• {acc.mask})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Currency Amount Input Fields */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Coins size={14} className="text-slate-400" /> Settlement Capital Value (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* 4. Memo Input Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <FileText size={14} className="text-slate-400" /> Audit Trail Reference Memo
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="e.g. Inter-account capital optimization balancing allocation"
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        {/* Status Message Prompt Feedback Blocks */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${statusMessage.type === "success"
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400"
            : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400"
            }`}>
            {statusMessage.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
            <span className="font-sans leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Form Outbound Submit Controller Trigger */}
        <button
          type="submit"
          disabled={isSubmitting || !sourceId || !destinationId || !amount}
          className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Compiling Transaction Data Logs...
            </>
          ) : (
            "Authorize Outbound Capital Clearing"
          )}
        </button>
      </form>
    </div>
  );
}