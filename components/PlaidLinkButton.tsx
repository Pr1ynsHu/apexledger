"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { ShieldAlert, Loader2, AlertCircle } from "lucide-react";
import { generateLinkToken } from "@/lib/actions/plaid.actions";
import { exchangePublicToken } from "@/lib/actions/vaults.actions";

interface PlaidButtonProps {
    userId: string;
}

export default function PlaidLinkButton({ userId }: PlaidButtonProps) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchLinkToken = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const result = await generateLinkToken({ userId, clientName: "ApexLedger Treasury" });

                if (result.success && result.linkToken) {
                    setToken(result.linkToken);
                } else if (result.error) {
                    setErrorMessage(result.error);
                }
            } catch (err: any) {
                setErrorMessage(err.message || "Failed to contact token generator.");
                console.error("Link Token Pipeline Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLinkToken();
    }, [userId]);

    const onSuccess = useCallback(async (public_token: string, metadata: any) => {
        setIsLoading(true);
        try {
            const response = await exchangePublicToken({
                publicToken: public_token,
                userId: userId,
                institutionId: metadata.institution?.institution_id || "ins_mock",
                bankName: metadata.institution?.name || "Institutional Asset Vault",
            });
            if (response.success) {
                console.log("Vault successfully linked into database clusters!");
            }
        } catch (err) {
            console.error("Exchange aborted:", err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const { open, ready } = usePlaidLink({
        token,
        onSuccess,
    });

    return (
        <div className="flex flex-col gap-2 w-full">
            <button
                onClick={() => open()}
                disabled={!ready || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Provisioning Vault...
                    </>
                ) : (
                    <>
                        <ShieldAlert size={16} />
                        Link Institutional Repository
                    </>
                )}
            </button>

            {errorMessage && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertCircle size={12} />
                    {errorMessage}
                </p>
            )}
        </div>
    );
}