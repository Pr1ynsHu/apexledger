import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "@/lib/logger";

// Model fallback chain — if primary is overloaded, try the next
const MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1500;

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  geminiHistory: any[],
  systemInstruction: string
) {
  let lastError: any = null;

  for (const modelId of MODEL_CANDIDATES) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId, systemInstruction });
        const result = await model.generateContent({ contents: geminiHistory });
        const text = result.response.text();

        log.info("Gemini response received", { modelId, attempt });
        return text;
      } catch (err: any) {
        lastError = err;
        const is429 = err?.message?.includes("429");
        const is503 = err?.message?.includes("503");

        if (is429 || is503) {
          log.warn("Rate limit or overload hit, retrying", { modelId, attempt, code: is429 ? 429 : 503 });
          // Wait with exponential backoff before retrying
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt)));
          }
          continue;
        }

        // Non-retryable error — bubble up immediately
        throw err;
      }
    }
    // Exhausted retries for this model, try next model in fallback chain
    log.warn("Model exhausted retries, falling back", { exhaustedModel: modelId });
  }

  // All models and retries exhausted
  throw lastError;
}

export async function POST(req: Request) {

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      log.error("Gemini configuration exception", { reason: "Missing environmental API token parameter" });
      await log.flush();
      return NextResponse.json({ error: "Gemini API key is unconfigured." }, { status: 500 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      log.warn("Payload rejection", { status: 400 });
      await log.flush();
      return NextResponse.json({ error: "Invalid messages payload structure." }, { status: 400 });
    }

    // 🚀 STEP 1: Filter out blank messages & normalize roles to "user" or "model"
    const cleanedMessages = messages
      .filter((msg: any) => msg && msg.content && msg.content.trim() !== "")
      .map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content.trim(),
      }));

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: "No clear textual messages to process." }, { status: 400 });
    }

    // 🚀 STEP 2: Force strict user-model-user alternating sequencing logic
    const geminiHistory: any[] = [];
    let expectedNextRole = "user"; // The conversation must always start with a user message

    for (const msg of cleanedMessages) {
      if (msg.role === expectedNextRole) {
        geminiHistory.push({
          role: msg.role,
          parts: [{ text: msg.content }],
        });
        // Flip the expected role for the next iteration
        expectedNextRole = expectedNextRole === "user" ? "model" : "user";
      } else {
        // Log a warning if the sequence breaks, but keep processing to prevent user crash
        log.warn("Alternating conversation sequence fixed", { skippedRole: msg.role });
      }
    }

    // Ensure the array doesn't end up completely empty after sequence validation
    if (geminiHistory.length === 0) {
      return NextResponse.json({ error: "Failed to establish a valid conversation sequence." }, { status: 400 });
    }

    log.info("Treasury chat transaction routing confirmed", {
      originalCount: messages.length,
      validatedHistoryDepth: geminiHistory.length,
    });

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `
      You are the ApexLedger Corporate Treasury Advisor. Your tone is highly professional, concise, objective, and analytical.
      Your primary function is to help corporate controllers evaluate runway trends, calculate burn rates, trace transaction irregularities, and optimize liquidity allocations.
      Keep answers brief, accurate, and structured with clean bullet points where relevant.
      Always speak from an enterprise viewpoint (e.g., use words like 'outbound clearings' instead of 'spending money').
    `;

    const aiResponseText = await generateWithRetry(genAI, geminiHistory, systemInstruction);

    log.info("Treasury chat matrix resolution successful", {
      responseCharacterCount: aiResponseText.length,
    });

    await log.flush();

    return NextResponse.json({
      role: "assistant",
      content: aiResponseText,
    });

  } catch (error: any) {
    log.error("Critical exception triggered inside Gemini route context", {
      message: error?.message,
      stack: error?.stack,
    });
    await log.flush();

    // Return a clear, actionable message for quota issues
    const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");
    if (isQuotaError) {
      return NextResponse.json(
        { error: "The Gemini API free-tier daily quota has been exhausted. Please wait for the quota to reset or upgrade to a paid plan at https://ai.google.dev." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "The AI node failed to resolve the parameters safely." },
      { status: 500 }
    );
  }
}