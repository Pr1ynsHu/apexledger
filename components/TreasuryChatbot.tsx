"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, RefreshCw } from "lucide-react";
import { logClientError } from "@/lib/actions/telemetry.actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function TreasuryChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Secured connection established. I am ready to process liquidity analysis, audit ledgers, or evaluate capital runway allocations. How may I assist you?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep chat scrolled down smoothly as messages load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      if (response.ok && data && data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else {
        const errorMsg = data?.error || "System communication failure. Verify API telemetry records.";
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
      }
    } catch (err) {
      logClientError("Failed to transmit query parameters:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Network error — unable to reach the treasury intelligence node." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-sm">
      {/* 🟢 Toggle Floating Action Button */}
      {!isOpen && (
        <button
          suppressHydrationWarning={true}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* 📂 Active Minimalist Corporate Chat Window */}
      {isOpen && (
        <div className="w-[360px] h-[460px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs uppercase tracking-wider font-mono">
                Treasury Intelligence Node
              </span>
            </div>
            <button
              suppressHydrationWarning={true}
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Node Stream Window */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-zinc-950/20">
            {messages.map((msg, index) => {
              const isAI = msg.role === "assistant";
              return (
                <div key={index} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${isAI
                        ? "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800/50 shadow-sm"
                        : "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase px-1">
                <RefreshCw size={10} className="animate-spin text-emerald-500" />
                Processing data logs...
              </div>
            )}
          </div>

          {/* Outbound Input Field Submission Control Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 flex items-center gap-2">
            <input
              suppressHydrationWarning={true}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about runway parameters or settlements..."
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:dark:border-emerald-400 font-sans"
            />
            <button
              suppressHydrationWarning={true}
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}