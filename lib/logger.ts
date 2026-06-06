import { Logger, ConsoleTransport, AxiomJSTransport } from '@axiomhq/logging';
import { Axiom } from '@axiomhq/js';

const axiomClient = new Axiom({
  token: process.env.AXIOM_TOKEN || "",
});

const axiom = new Logger({
  transports: [
    new AxiomJSTransport({ axiom: axiomClient, dataset: process.env.AXIOM_DATASET || "default" }),
    new ConsoleTransport({ prettyPrint: true }),
  ]
});

export const log = {
  info: (message: string, meta?: Record<string, any>) => {
    axiom.info(message, meta);
  },
  warn: (message: string, meta?: Record<string, any>) => {
    axiom.warn(message, meta);
  },
  // 🚀 THE UPGRADE: Destructure or accept error cleanly without type-bleeding
  error: (message: string, error?: any, meta?: Record<string, any>) => {
    axiom.error(message, {
      // Safely parse strings vs actual JS Error objects passed from catch blocks
      errorMessage: error instanceof Error ? error.message : (error?.message || String(error || "")),
      stack: error instanceof Error ? error.stack : error?.stack,
      ...meta,
    });
  },
  flush: async () => {
    await axiom.flush();
  }
};