"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  BookOpen,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}


export function StudyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste Student! 🎓 I'm your **CompX AI Study Copilot**.\n\nAsk me any question or doubt across **School (Class 6-12), JEE, NEET, UPSC, SSC, Defence (NDA/CDS), or B.Tech/Engineering**. I can solve numericals, explain formulas, and share exam strategies in **English, Hinglish, or Hindi**!\n\nWhat are you studying today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "⚡ Top formulas for JEE Physics Mechanics",
    "💡 Explain Newton's 3rd Law with real example",
    "🏛️ How to revise UPSC Modern History fast?",
    "🌿 Difference between C3 and C4 plants for NEET",
    "💻 Explain Time Complexity of QuickSort in B.Tech",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, I couldn't process that. Please ask again!" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Network glitch or service busy. Please check your connection or try asking again in a few moments!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! 🧹 What question or exam topic would you like to explore next?",
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${isExpanded
              ? "w-[92vw] sm:w-[540px] h-[82vh]"
              : "w-[92vw] sm:w-[400px] h-[560px]"
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 shadow-sm">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm sm:text-base leading-none">CompX AI Copilot</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-indigo-100 font-medium mt-0.5">
                  24/7 Academic Doubt Solver (Groq Llama 3)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title={isExpanded ? "Collapse Window" : "Expand Window"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar (visible if few messages) */}
          {messages.length <= 2 && (
            <div className="bg-indigo-50/80 dark:bg-slate-800/80 border-b border-indigo-100 dark:border-slate-800 p-2.5 overflow-x-auto shrink-0 flex gap-1.5 no-scrollbar">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 px-1 shrink-0">
                <Lightbulb className="w-3.5 h-3.5" /> Quick:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-slate-700 shrink-0 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${m.role === "user"
                      ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-tr-none shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                    }`}
                >
                  {m.content}
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-500 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-400">CompX AI is solving...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any subject doubt or exam question..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Powered by Groq • Ask in English, Hinglish or Hindi
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-500 hover:from-blue-800 hover:to-indigo-700 text-white font-bold rounded-full shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all duration-200"
        aria-label="Open AI Study Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-ping" />
        </div>
        <span className="text-xs sm:text-sm font-bold">Ask CompX AI</span>
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}

