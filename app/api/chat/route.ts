import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are the ApexLedger Executive Financial Advisor, a highly conversational, intelligent, and human-like AI assistant.
      Your goal is to assist the Chief Treasury Officer with liquidity, risk management, capital allocation, and interpreting dashboard metrics.
      
      IMPORTANT RULES:
      1. Speak naturally and conversationally, like an expert human advisor talking directly to the CTO.
      2. Keep your responses concise and highly professional.
      3. Use markdown formatting (bolding, lists) to make financial data and key points easy to read.
      
      User message: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { reply: "I am unable to process your request at this time. Please check your API key configuration." },
      { status: 500 }
    );
  }
}
