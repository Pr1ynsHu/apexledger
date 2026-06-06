"use client";

import { useState } from "react";
import { Copy, Check, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface VaultCardProps {
    bankName: string;
    accountName: string;
    mask: string;
    sharableId: string;
}

export default function AssetVaultCard({ bankName, accountName, mask, sharableId }: VaultCardProps) {
    const [copied, setCopied] = useState(false);
    const [showFullId, setShowFullId] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(sharableId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard failure:", err);
        }
    };

    return (
        <div className="w-full rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg transition-all hover:border-slate-700">
            {/* Brand Architecture */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                        {bankName}
                    </span>
                    <h3 className="text-base font-semibold text-slate-100">
                        {accountName}
                    </h3>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck size={16} />
                </div>
            </div>

            {/* Masked Metrics Block */}
            <div className="flex flex-col gap-1 mb-6">
                <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                    Institutional Clearing Identifier
                </span>
                <div className="font-mono text-base tracking-widest text-slate-300">
                    •••• •••• •••• <span className="text-emerald-400 font-bold">{mask}</span>
                </div>
            </div>

            {/* Shareable Router Field */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                    Outbound Settlement Router ID
                </span>
                <div className="flex items-center justify-between gap-2 bg-slate-950 rounded-xl px-3 py-2 border border-slate-800/60">
                    <span className="font-mono text-xs text-slate-400 truncate">
                        {showFullId ? sharableId : `${sharableId.substring(0, 12)}...`}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setShowFullId(!showFullId)}
                            className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                            {showFullId ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-1 rounded text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}