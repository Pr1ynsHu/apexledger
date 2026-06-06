"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { getOperatorProfile, updateOperatorProfile } from "@/lib/actions/profile.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export default function ProfilePage() {
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getOperatorProfile();
        if (profile) {
          setName(profile.name);
          setRole(profile.role);
          setEmail(profile.email);
          form.setValue("name", profile.name);
          form.setValue("role", profile.role);
          form.setValue("email", profile.email);
        } else {
          // Defaults if never set
          setName("Operator");
          setRole("Chief Treasury Officer");
          setEmail("operator@apexledger.corp");
          form.setValue("name", "Operator");
          form.setValue("role", "Chief Treasury Officer");
          form.setValue("email", "operator@apexledger.corp");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [form]);

  const handleProfileSubmit = async () => {
    if (!name || !role || !email || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await updateOperatorProfile({ name, role, email });

      if (result.success) {
        setStatusMessage({ type: "success", text: "Operator preferences updated successfully." });
        router.refresh();
      } else {
        setStatusMessage({ type: "error", text: result.error || "Failed to update operator profile." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Network connection timeout during execution." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-mono text-xs uppercase gap-2">
        <Loader2 className="animate-spin text-emerald-500" size={18} />
        Synchronizing operator identity matrices...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Title Header Viewport */}
      <div>
        <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <User className="text-emerald-500" size={20} />
          Operator Profile Settings
        </h1>
        <p className="text-xs text-slate-400 font-mono uppercase mt-1">
          Manage System Identity & Preferences
        </p>
      </div>

      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-5">
            
            {/* 1. Name Input Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Priyanshu Kalsi"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Role Input Field */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-slate-400" /> Job Role / Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Chief Treasury Officer"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Email Input Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" /> Notification Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. p.kalsi@apexledger.corp"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl px-3 h-10 text-sm focus-visible:ring-emerald-500 font-sans"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Message Prompt Feedback Blocks */}
            {statusMessage && (
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${statusMessage.type === "success"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400"
                : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400"
                }`}>
                {statusMessage.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                <span className="font-sans leading-relaxed">{statusMessage.text}</span>
              </div>
            )}

            {/* Action Form Outbound Submit Controller Trigger */}
            <Button
              type="submit"
              disabled={isSubmitting || !name || !role || !email}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
