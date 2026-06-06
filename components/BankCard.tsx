import React from "react";
import { Landmark } from "lucide-react";

export interface BankCardProps {
  bankName: string;
  mask: string;
  currentBalance: number;
}

export function BankCard({ bankName, mask, currentBalance }: BankCardProps) {
  return (
    <div className="w-[320px] h-[200px] rounded-[20px] bank-gradient text-white p-6 flex flex-col justify-between shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="text-emerald-400" size={24} />
          <span className="font-semibold tracking-wide text-sm">{bankName}</span>
        </div>
        <div className="h-6 w-10 bg-white/20 backdrop-blur-md rounded-md"></div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-slate-300 font-mono tracking-widest uppercase mb-1">
          Current Balance
        </p>
        <p className="text-2xl font-bold font-mono tracking-tight">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(currentBalance)}
        </p>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            Card Number
          </span>
          <span className="text-sm font-mono tracking-widest">
            •••• •••• •••• {mask}
          </span>
        </div>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-red-500/80 mix-blend-multiply"></div>
          <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
}
