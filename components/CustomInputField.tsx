"use client";

import { UseFormRegister } from "react-hook-form";
import { z } from "zod";

export const authFormSchema = z.object({
    email: z.string().email("Invalid corporate email address format."),
    password: z.string().min(8, "Security mandate requires a minimum of 8 characters."),
    firstName: z.string().min(2, "First name validation clearance requires 2+ characters."),
    lastName: z.string().min(2, "Last name validation clearance requires 2+ characters."),
    addressOne: z.string().max(100, "Address allocation bound maxed at 100 characters."),
    city: z.string().min(2, "Valid city identifier mandatory."),
    state: z.string().length(2, "State token must be exactly 2 characters (e.g., NY)."),
    postalCode: z.string().min(5, "Postal string validation requires 5+ characters.").max(10, "Postal limit hit."),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must strictly follow YYYY-MM-DD."),
});

interface InputProps {
    register: UseFormRegister<any>;
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    error?: string;
}

export default function CustomInputField({ register, name, label, placeholder, type = "text", error }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {label}
            </label>
            <div className="flex flex-col w-full relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 dark:bg-slate-900 dark:text-white ${
                        error 
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/50" 
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-slate-800 dark:focus:border-emerald-500"
                    }`}
                    {...register(name)}
                />
            </div>
            {error && (
                <span className="text-[11px] text-red-500 font-medium ml-1">
                    {error}
                </span>
            )}
        </div>
    );
}