"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { authFormSchema } from "@/components/CustomInputField";
import CustomInputField from "@/components/CustomInputField";
import { signInUser } from "@/lib/actions/auth.actions"; // Import our new action
import { Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";

export default function SignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof authFormSchema>>({
        resolver: zodResolver(authFormSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
        setIsLoading(true);
        setFormError(null);
        try {
            const response = await signInUser({ email: data.email, password: data.password });

            if (response.success) {
                // 2. Clear credentials and route straight to our asset control deck
                router.push("/vaults");
                router.refresh();
            } else if (response.error) {
                setFormError(response.error);
            }
        } catch (err: any) {
            setFormError("An unexpected systemic authentication crash occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto p-6">
            <div className="flex flex-col gap-1.5 text-center">
                <h1 className="text-xl font-bold text-white">Access Vault Key Exchange</h1>
                <p className="text-xs text-slate-400">Provide clearance credentials to mount treasury layers.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <CustomInputField register={form.register} name="email" label="Corporate Email" placeholder="pkalsi@apexledger.internal" type="email" error={form.formState.errors.email?.message} />
                <CustomInputField register={form.register} name="password" label="Access Key Vault Password" placeholder="••••••••••••" type="password" error={form.formState.errors.password?.message} />

                {formError && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-400 font-mono flex items-center gap-2">
                        <AlertCircle size={14} />
                        {formError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-40 cursor-pointer"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Security Clearance"}
                </button>
            </form>

            <footer className="flex items-center justify-center gap-1 pt-2 text-xs">
                <span className="text-slate-400">Do not possess clearance keys yet?</span>
                <Link href="/auth/sign-up" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                    Initialize Profile
                </Link>
            </footer>
        </div>
    );
}