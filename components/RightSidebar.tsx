"use client";

import {
  User,
  Shield,
  ChevronDown,
  Monitor,
  HardDrive,
  Scale,
} from "lucide-react";
import { useState } from "react";

/* ─── Dummy Data ─── */

const userProfile = {
  name: "Victoria Hargrove",
  role: "Chief Treasury Officer",
  clearanceLevel: "L4 — Executive",
  lastAuth: "2026-06-06T14:32:00Z",
};

const allocations = [
  {
    label: "Software Licensing",
    category: "SFT",
    amount: 124800,
    budget: 200000,
    icon: Monitor,
    color: "#10b981", // emerald-500
  },
  {
    label: "Hardware Procurement",
    category: "HDW",
    amount: 78250,
    budget: 150000,
    icon: HardDrive,
    color: "#14b8a6", // teal-500
  },
  {
    label: "Legal & Compliance",
    category: "LGL",
    amount: 43100,
    budget: 60000,
    icon: Scale,
    color: "#64748b", // slate-500
  },
];

export default function RightSidebar() {
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-[280px] min-h-screen border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 overflow-y-auto">
      {/* ─── Profile Card ─── */}
      <div className="px-4 pt-6 pb-5">
        <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-slate-500 dark:text-zinc-600 uppercase mb-4 block">
          Operator Profile
        </span>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/60 p-4">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                <User size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-zinc-950" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {userProfile.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-500 truncate">
                {userProfile.role}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield size={11} className="text-slate-500 dark:text-zinc-600" />
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">
                  Clearance
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {userProfile.clearanceLevel}
              </span>
            </div>

            <div className="h-px bg-slate-200 dark:bg-zinc-800/60" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">
                Last Auth
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                {new Date(userProfile.lastAuth).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
                {" UTC"}
              </span>
            </div>

            <div className="h-px bg-slate-200 dark:bg-zinc-800/60" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">
                Session
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Expand */}
          <button 
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            className="w-full mt-3.5 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-slate-200 dark:border-transparent text-slate-600 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Full Profile
            <ChevronDown size={12} className={`transition-transform duration-200 ${isProfileExpanded ? "rotate-180" : ""}`} />
          </button>

          {isProfileExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800/60 animate-fade-in space-y-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">Department</span>
                <span className="text-xs text-slate-800 dark:text-zinc-200">Global Treasury & Markets</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">Contact Email</span>
                <span className="text-xs text-slate-800 dark:text-zinc-200">v.hargrove@apexledger.corp</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-wider uppercase">Device ID</span>
                <span className="text-xs font-mono text-slate-800 dark:text-zinc-200">MBP-XQ89-SECURE</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent" />

      {/* ─── Asset Allocations ─── */}
      <div className="px-4 pt-5 pb-6 flex-1">
        <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-slate-500 dark:text-zinc-600 uppercase mb-4 block">
          Asset Allocations
        </span>

        <div className="space-y-4">
          {allocations.map((item) => {
            const percentage = Math.round((item.amount / item.budget) * 100);
            const Icon = item.icon;

            return (
              <div
                key={item.category}
                className="rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 p-3.5 transition-colors hover:border-slate-300 dark:hover:border-zinc-700/60"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: item.color }} />
                    <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-zinc-600 uppercase">
                    {item.category}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800/80 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(item.amount)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-600">
                    of{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(item.budget)}
                  </span>
                </div>

                {/* Percentage badge */}
                <div className="mt-2 flex justify-end">
                  <span
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: item.color,
                      backgroundColor: `${item.color}15`,
                    }}
                  >
                    {percentage}% utilized
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-5 rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-900/30 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Total Allocated
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-200">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(allocations.reduce((s, a) => s + a.amount, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-600 uppercase tracking-wider">
              Total Budget
            </span>
            <span className="text-xs font-mono text-slate-600 dark:text-zinc-500">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(allocations.reduce((s, a) => s + a.budget, 0))}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
