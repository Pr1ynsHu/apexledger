"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { Loader2, AlertCircle, Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { signInUser } from "@/lib/actions/auth.actions";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsLoading(true);
        setFormError(null);
        try {
            const response = await signInUser({ email: data.email, password: data.password });

            if (response.success) {
                // Ensure a clean window.location.href redirect to push hard past middleware
                window.location.href = "/vaults";
            } else if (response.error) {
                setFormError(response.error);
                setIsLoading(false);
            }
        } catch (err: any) {
            setFormError("An unexpected systemic authentication crash occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#090a0f] overflow-hidden selection:bg-emerald-500/30 w-full">
            {/* Grid Mask Background */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem',
                    maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)'
                }}
            />

            {/* Ambient Background Glow Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Main Card Structure */}
            <div className="relative z-10 flex flex-col gap-8 w-full max-w-[420px] p-8 mx-auto rounded-3xl border border-white/[0.05] bg-[#0d0e14]/80 backdrop-blur-xl shadow-2xl">
                
                {/* Header */}
                <div className="flex flex-col gap-2 items-center text-center">
                    <div className="w-14 h-14 mb-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck size={28} className="text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Access Vault Node</h1>
                    <p className="text-sm text-slate-400">Provide clearance credentials to mount treasury layers.</p>
                </div>

                {/* Form */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Corporate Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                {...form.register("email")}
                                type="email"
                                placeholder="operator@apexledger.internal"
                                className="w-full bg-[#090a0f] border border-white/[0.08] rounded-xl pl-10 pr-4 h-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                        {form.formState.errors.email && (
                            <span className="text-xs text-rose-400 mt-1">{form.formState.errors.email.message}</span>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Access Key</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                {...form.register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                className="w-full bg-[#090a0f] border border-white/[0.08] rounded-xl pl-10 pr-10 h-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono tracking-widest"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <span className="text-xs text-rose-400 mt-1">{form.formState.errors.password.message}</span>
                        )}
                    </div>

                    {/* Error Banner */}
                    {formError && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-mono flex items-start gap-2.5">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{formError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Verifying Clearance...</span>
                            </>
                        ) : (
                            <span>Initialize Session</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <footer className="flex items-center justify-center gap-1.5 pt-2 text-xs">
                    <span className="text-slate-500">Do not possess clearance keys yet?</span>
                    <Link href="/auth/sign-up" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Request Access
                    </Link>
                </footer>
            </div>
        </div>
    );
}