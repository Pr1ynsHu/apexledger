"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Coins,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Hash,
  User,
  RefreshCw,
} from "lucide-react";
import { initiateTreasuryTransfer } from "@/lib/actions/transfers.actions";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface BankAccount {
  account_id: string;
  official_name: string;
  current_balance: number;
  mask: string;
}

export default function TransferForm({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const router = useRouter();
  const [accounts] = useState<BankAccount[]>(initialAccounts);

  // ─── Transaction Mode ───
  const [transactionType, setTransactionType] = useState<"internal" | "outbound" | "inbound">("internal");

  // ─── Shared State ───
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  // ─── Internal Transfer State ───
  const [intSourceId, setIntSourceId] = useState(initialAccounts[0]?.account_id || "");
  const [intDestinationId, setIntDestinationId] = useState("");

  // ─── Outbound Payout State ───
  const [outSourceId, setOutSourceId] = useState(initialAccounts[0]?.account_id || "");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");

  // ─── Inbound Deposit State ───
  const [senderName, setSenderName] = useState("");
  const [inDestinationId, setInDestinationId] = useState(initialAccounts[0]?.account_id || "");

  // ─── Outbound Classification ───
  const [transactionScope, setTransactionScope] = useState<"opex" | "treasury">("opex");
  const [category, setCategory] = useState("");

  // ─── UX State ───
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm({
    defaultValues: {
      sourceId: initialAccounts[0]?.account_id || "",
      destinationId: "",
      amount: "",
      memo: "",
      category: "",
    },
  });

  const isInternalValid = intSourceId && intDestinationId && amount && intSourceId !== intDestinationId;
  const isOutboundValid = outSourceId && beneficiaryName && destinationAccountNumber && routingNumber && amount && category && transactionScope;
  const isInboundValid = senderName && inDestinationId && amount;

  let isFormValid = false;
  if (transactionType === "internal") isFormValid = !!isInternalValid;
  if (transactionType === "outbound") isFormValid = !!isOutboundValid;
  if (transactionType === "inbound") isFormValid = !!isInboundValid;

  const handleTransferSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const uniqueIdempotencySignature = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build the payload based on mode
    let sourceAccountId = "";
    let destinationAccountId = "";
    let extRouting = undefined;
    let extAccount = undefined;
    let benName = undefined;

    let extCategory = undefined;
    let extScope = undefined;

    if (transactionType === "internal") {
      sourceAccountId = intSourceId;
      destinationAccountId = intDestinationId;
    } else if (transactionType === "outbound") {
      sourceAccountId = outSourceId;
      destinationAccountId = "External Payout";
      extRouting = routingNumber;
      extAccount = destinationAccountNumber;
      benName = beneficiaryName;
      extCategory = category;
      extScope = transactionScope;
    } else if (transactionType === "inbound") {
      sourceAccountId = senderName; // External sender name
      destinationAccountId = inDestinationId;
    }

    try {
      const result = await initiateTreasuryTransfer({
        sourceAccountId,
        destinationAccountId,
        amount: parseFloat(amount),
        memo,
        idempotencyKey: uniqueIdempotencySignature,
        transactionType,
        externalRoutingNumber: extRouting,
        externalAccountNumber: extAccount,
        beneficiaryName: benName,
        category: extCategory,
        transactionScope: extScope,
      });

      if (result.success) {
        let successMsg = "Internal vault transfer processed successfully.";
        if (transactionType === "outbound") successMsg = "Outbound payout routing confirmed. Settlement row pending.";
        if (transactionType === "inbound") successMsg = "Inbound deposit accepted. Credit entry committed to ledger.";
        
        setStatusMessage({ type: "success", text: successMsg });
        setAmount("");
        setMemo("");
        setBeneficiaryName("");
        setRoutingNumber("");
        setDestinationAccountNumber("");
        setSenderName("");
        setCategory("");
        setTransactionScope("opex");
        form.setValue("amount", "");
        form.setValue("memo", "");
        form.setValue("category", "");
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
          Multi-Directional Treasury Clearing Engine
        </p>
      </div>

      {/* Transaction Type Toggle */}
      <Tabs
        defaultValue="internal"
        value={transactionType}
        onValueChange={(val) => {
          setTransactionType(val as "internal" | "outbound" | "inbound");
          setStatusMessage(null);
        }}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3 h-11 rounded-xl bg-slate-100 dark:bg-zinc-800/60 p-1">
          <TabsTrigger
            value="internal"
            className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-900 data-[state=active]:text-indigo-600 data-[state=active]:dark:text-indigo-400 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            Internal
          </TabsTrigger>
          <TabsTrigger
            value="outbound"
            className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-900 data-[state=active]:text-rose-600 data-[state=active]:dark:text-rose-400 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight size={13} />
            Outbound
          </TabsTrigger>
          <TabsTrigger
            value="inbound"
            className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-900 data-[state=active]:text-emerald-600 data-[state=active]:dark:text-emerald-400 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft size={13} />
            Inbound
          </TabsTrigger>
        </TabsList>

        <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTransferSubmit)} className="space-y-5">

              {/* ═══════════ INTERNAL TRANSFER TAB ═══════════ */}
              <TabsContent value="internal" className="space-y-5 mt-0">
                <FormField
                  control={form.control}
                  name="sourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Landmark size={14} className="text-slate-400" /> Origin Liquidity Node (Debit Source)
                      </FormLabel>
                      <Select
                        value={intSourceId}
                        onValueChange={(val) => {
                          setIntSourceId(val);
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
                <FormField
                  control={form.control}
                  name="destinationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Landmark size={14} className="text-slate-400" /> Target Vault Allocation Node (Credit Destination)
                      </FormLabel>
                      <Select
                        value={intDestinationId}
                        onValueChange={(val) => {
                          setIntDestinationId(val);
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
              </TabsContent>

              {/* ═══════════ OUTBOUND PAYOUT TAB ═══════════ */}
              <TabsContent value="outbound" className="space-y-5 mt-0">
                <div className="p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-xl grid grid-cols-2 gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => { setTransactionScope("opex"); setCategory(""); form.setValue("category", ""); }}
                    className={`py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                      transactionScope === "opex"
                        ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50"
                    }`}
                  >
                    OpEx Clearing
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTransactionScope("treasury"); setCategory(""); form.setValue("category", ""); }}
                    className={`py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                      transactionScope === "treasury"
                        ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50"
                    }`}
                  >
                    Treasury Action
                  </button>
                </div>

                <FormField
                  control={form.control}
                  name="sourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Landmark size={14} className="text-slate-400" /> Origin Liquidity Node (Debit Source)
                      </FormLabel>
                      <Select
                        value={outSourceId}
                        onValueChange={(val) => {
                          setOutSourceId(val);
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

                <div className="space-y-3 p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-950/30">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    External Beneficiary Details
                  </span>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                        <User size={14} className="text-slate-400" /> Beneficiary Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. John Doe Holdings LLC"
                        className="w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                          <Building2 size={14} className="text-slate-400" /> Routing Number
                        </label>
                        <Input
                          type="text"
                          placeholder="021000021"
                          maxLength={9}
                          className="w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-mono"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                          <Hash size={14} className="text-slate-400" /> Account Number
                        </label>
                        <Input
                          type="text"
                          placeholder="••••••••1234"
                          className="w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-mono"
                          value={destinationAccountNumber}
                          onChange={(e) => setDestinationAccountNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ═══════════ INBOUND DEPOSIT TAB ═══════════ */}
              <TabsContent value="inbound" className="space-y-5 mt-0">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                    <Building2 size={14} className="text-emerald-500" /> Sender Client / Institution Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Stripe Clearing Payout, Acme Corp Escrow"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="destinationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Landmark size={14} className="text-emerald-500" /> Target Settlement Node (Credit Destination)
                      </FormLabel>
                      <Select
                        value={inDestinationId}
                        onValueChange={(val) => {
                          setInDestinationId(val);
                          field.onChange(val);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus:ring-emerald-500">
                            <SelectValue placeholder="Select target settlement node..." />
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
              </TabsContent>

              {/* ═══════════ SHARED FIELDS ═══════════ */}
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
                        placeholder={
                          transactionType === "internal"
                            ? "e.g. Vault rebalancing transfer"
                            : transactionType === "outbound"
                            ? "e.g. Q4 vendor settlement payout"
                            : "e.g. Client wire deposit — Invoice #4827"
                        }
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

              {statusMessage && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${statusMessage.type === "success"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400"
                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400"
                  }`}>
                  {statusMessage.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <span className="font-sans leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              {transactionType === "outbound" && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {transactionScope === "opex" ? "OpEx Category Classification" : "Treasury Action Classification"}
                      </FormLabel>
                      <Select
                        value={category}
                        onValueChange={(val) => {
                          setCategory(val);
                          field.onChange(val);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500">
                            <SelectValue placeholder="Select classification code..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transactionScope === "opex" ? (
                            <>
                              <SelectItem value="SFT">SFT — Software Licensing</SelectItem>
                              <SelectItem value="HDW">HDW — Hardware Procurement</SelectItem>
                              <SelectItem value="LGL">LGL — Legal & Compliance</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="TAX">TAX — Corporate Tax Remittance</SelectItem>
                              <SelectItem value="DIV">DIV — Shareholder Dividend</SelectItem>
                              <SelectItem value="REB">REB — Vendor Rebate</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full h-10 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm mt-2 ${
                  transactionType === "internal"
                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white"
                    : transactionType === "outbound"
                    ? "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Compiling Transaction Data Logs...
                  </>
                ) : transactionType === "internal" ? (
                  <>
                    <RefreshCw size={14} />
                    Execute Internal Transfer
                  </>
                ) : transactionType === "outbound" ? (
                  <>
                    <ArrowUpRight size={14} />
                    Authorize Outbound Capital Clearing
                  </>
                ) : (
                  <>
                    <ArrowDownLeft size={14} />
                    Record Inbound Client Deposit
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </Tabs>
    </div>
  );
}