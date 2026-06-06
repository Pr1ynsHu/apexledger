"use client";

import { BankCard } from "@/components/BankCard";

export interface BankAccount {
  account_id: string;
  official_name: string;
  mask: string;
  current_balance: number;
}

export default function BankCardGrid({ accounts }: { accounts: BankAccount[] }) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="w-full p-12 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
          No institutional clearing channels connected.
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-[280px]">
          Authorize an outbound link channel to stream transactional ledger entries.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group/grid w-full py-4 overflow-x-visible">
      <div className="flex flex-col sm:flex-row gap-6 w-full items-start transition-all duration-500 ease-out sm:group-hover/grid:gap-8">
        {accounts.map((account, idx) => (
          <div
            key={account.account_id}
            className="w-full sm:w-[320px] shrink-0 transition-transform duration-500 hover:-translate-y-4 hover:scale-[1.02] sm:-ml-12 sm:first:ml-0 hover:z-10 relative cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-primary/20 rounded-2xl"
            style={{ zIndex: accounts.length - idx }}
          >
            <BankCard
              bankName={account.official_name}
              mask={account.mask || "****"}
              currentBalance={account.current_balance || 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
