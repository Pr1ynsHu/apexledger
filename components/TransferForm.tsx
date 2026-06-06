"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRightLeft, Landmark, Coins, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { initiateTreasuryTransfer } from "@/lib/actions/transfers.actions";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface BankAccount {
  account_id: string;
  official_name: string;
  current_balance: number;
  mask: string;
}

export default function TransferForm({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const router = useRouter();
  const [accounts] = useState<BankAccount[]>(initialAccounts);

  // Form State Containers
  const [sourceId, setSourceId] = useState(initialAccounts[0]?.account_id || "");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  // Status UX States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm({
    defaultValues: {
      sourceId: initialAccounts[0]?.account_id || "",
      destinationId: "",
      amount: "",
      memo: ""
    }
  });

  const handleTransferSubmit = async () => {
    if (!sourceId || !destinationId || !amount || isSubmitting) return;
    if (sourceId === destinationId) {
      setStatusMessage({ type: "error", text: "Source and destination liquidity nodes cannot be identical." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

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
        form.setValue("amount", "");
        form.setValue("memo", "");
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


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
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

      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleTransferSubmit)} className="space-y-5">
            {/* 1. Source Account Node Selection Menu */}
            <FormField
              control={form.control}
              name="sourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Landmark size={14} className="text-slate-400" /> Origin Liquidity Node (Debit Source)
                  </FormLabel>
                  <Select 
                    value={sourceId} 
                    onValueChange={(val) => {
                      setSourceId(val);
                      field.onChange(val);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus:ring-emerald-500">
                        <SelectValue placeholder="Select origin node..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.account_id} value={acc.account_id}>
                          {acc.official_name} (•••• {acc.mask}) — ${acc.current_balance.toLocaleString()} USD
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Destination Account Node Selection Menu */}
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Landmark size={14} className="text-slate-400" /> Target Vault Allocation Node (Credit Destination)
                  </FormLabel>
                  <Select 
                    value={destinationId} 
                    onValueChange={(val) => {
                      setDestinationId(val);
                      field.onChange(val);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus:ring-emerald-500">
                        <SelectValue placeholder="Select target routing vault account..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.account_id} value={acc.account_id}>
                          {acc.official_name} (•••• {acc.mask})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Currency Amount Input Fields */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Coins size={14} className="text-slate-400" /> Settlement Capital Value (USD)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm z-10">$</span>
                      <Input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 h-10 text-sm focus-visible:ring-emerald-500 font-mono"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Memo Input Area */}
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" /> Audit Trail Reference Memo
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. Inter-account capital optimization balancing allocation"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                      value={memo}
                      onChange={(e) => {
                        setMemo(e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <Button
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
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}