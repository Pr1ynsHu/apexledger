"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  FileSearch,
  Landmark,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutUser } from "@/lib/actions/auth.actions";
import SystemStatusTicker from "./SystemStatusTicker";
import SignOutButton from "./SignOutButton";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Ledger Audit",
    href: "/ledger",
    icon: FileSearch,
  },
  {
    label: "Connected Vaults",
    href: "/vaults",
    icon: Landmark,
  },
  {
    label: "Outbound Routing",
    href: "/transfer",
    icon: ArrowUpRight,
  },
  {
    label: "Operator Profile",
    href: "/profile",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
      {/* Logo Block */}
      <div className="px-5 pt-7 pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
            <Wallet size={18} className="text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
              ApexLedger
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 tracking-widest uppercase mt-0.5">
              Treasury OS
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-slate-200 dark:from-zinc-800 via-slate-100 dark:via-zinc-800/50 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-5">
        <span className="px-3 text-[10px] font-mono font-semibold tracking-[0.2em] text-slate-500 dark:text-zinc-500 uppercase mb-3 block">
          Operations
        </span>
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/15"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"
                      }`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-emerald-500/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Footer */}
      <div className="mx-3 mb-4 flex items-center gap-2">
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/40 p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Activity size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-500 uppercase">
              System Status
            </span>
          </div>
          <SystemStatusTicker />
        </div>
        <div className="flex flex-col gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
