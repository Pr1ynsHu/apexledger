"use server";

import { log } from "@/lib/logger";

export async function logClientError(message: string, error?: any, meta?: Record<string, any>) {
    log.error(message, error, meta);
    await log.flush();
}

export async function logClientInfo(message: string, meta?: Record<string, any>) {
    log.info(message, meta);
    await log.flush();
}
