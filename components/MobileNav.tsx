"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  FileSearch,
  Landmark,
  ArrowUpRight,
  ChevronRight,
  Activity,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Ledger Audit", href: "/ledger", icon: FileSearch },
  { label: "Connected Vaults", href: "/vaults", icon: Landmark },
  { label: "Outbound Routing", href: "/transfer", icon: ArrowUpRight },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <Wallet size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
            ApexLedger
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            id="mobile-nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`
          md:hidden fixed top-0 left-0 z-50 h-full w-[280px] bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
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
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-slate-200 dark:from-zinc-800 via-slate-100 dark:via-zinc-800/50 to-transparent" />

        {/* Nav Links */}
        <nav className="px-3 pt-5">
          <span className="px-3 text-[10px] font-mono font-semibold tracking-[0.2em] text-slate-500 dark:text-zinc-500 uppercase mb-3 block">
            Operations
          </span>
          <ul className="space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
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
                      <ChevronRight
                        size={14}
                        className="text-emerald-500/60"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Status Footer */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/40 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-500 uppercase">
                System Status
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              </div>
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                All pipelines operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
