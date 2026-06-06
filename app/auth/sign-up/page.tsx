"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import CustomInputField, { authFormSchema } from "@/components/CustomInputField";

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Initialize our react-hook-form engine bound securely to our Zod schema configurations
    const form = useForm<z.infer<typeof authFormSchema>>({
        resolver: zodResolver(authFormSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            addressOne: "",
            city: "",
            state: "",
            postalCode: "",
            dateOfBirth: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
        setIsLoading(true);
        setFormError(null);
        try {
            const { signUpUser } = await import("@/lib/actions/auth.actions");
            const response = await signUpUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                addressOne: data.addressOne || "",
                city: data.city || "",
                state: data.state || "",
                postalCode: data.postalCode || "",
                dateOfBirth: data.dateOfBirth || "",
            });

            if (response.success) {
                router.push("/vaults");
                router.refresh();
            } else if (response.error) {
                setFormError(response.error);
            }
        } catch (err: any) {
            setFormError("An unexpected systemic failure occurred during identity creation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
            <div className="flex w-full max-w-[540px] flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">

                {/* Top Branding Section */}
                <header className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            APEX<span className="text-emerald-600 dark:text-emerald-400">LEDGER</span>
                        </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl mt-2">
                        Initialize Treasury Access
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Provide identity data mapping parameters to clear verification checks.
                    </p>
                </header>

                {/* Dynamic Error Status Box - Unified to use formError */}
                {formError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* Main Entry Interactive Form Layout */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

                    {/* Identity Grid Row */}
                    <div className="flex gap-4 max-sm:flex-col">
                        <CustomInputField register={form.register} name="firstName" label="First Name" placeholder="Priyanshu" />
                        <CustomInputField register={form.register} name="lastName" label="Last Name" placeholder="Kalsi" />
                    </div>

                    {/* Location Routing Grid Rows */}
                    <CustomInputField register={form.register} name="addressOne" label="Operational Address" placeholder="123 Financial District Ave" />

                    <div className="grid grid-cols-3 gap-4 max-sm:flex max-sm:flex-col">
                        <div className="col-span-1"><CustomInputField register={form.register} name="city" label="City" placeholder="Amritsar" /></div>
                        <div className="col-span-1"><CustomInputField register={form.register} name="state" label="State Code" placeholder="PB" /></div>
                        <div className="col-span-1"><CustomInputField register={form.register} name="postalCode" label="Postal ID" placeholder="143001" /></div>
                    </div>

                    {/* Validation Metrics Grid Row */}
                    <div className="flex gap-4 max-sm:flex-col">
                        <CustomInputField register={form.register} name="dateOfBirth" label="Date of Birth" placeholder="YYYY-MM-DD" />
                        <CustomInputField register={form.register} name="email" label="Corporate Email" placeholder="pkalsi@apexledger.internal" type="email" />
                    </div>

                    <CustomInputField register={form.register} name="password" label="Access Key Vault Password" placeholder="••••••••••••" type="password" />

                    {/* Action Trigger Button System */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Executing Validation Clearance...
                            </>
                        ) : (
                            "Authorize Signature Profile"
                        )}
                    </button>
                </form>

                {/* Redirection Linkage Area */}
                <footer className="flex items-center justify-center gap-1 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
                    <span className="text-slate-400">Already possess system operational keys?</span>
                    <Link href="/auth/sign-in" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                        Sign In
                    </Link>
                </footer>
            </div>
        </div>
    );
}