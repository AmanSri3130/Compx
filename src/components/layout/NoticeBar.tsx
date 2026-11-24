"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, MessageCircle, Send } from "lucide-react";

export function NoticeBar({ text, enabled = true }: { text?: string; enabled?: boolean }) {
  const [visible, setVisible] = useState(true);

  if (!enabled || !visible) return null;

  const defaultText = text || "🎉 Big Exam Season 2026: Use code 'COMPX50' for 50% discount on all Topper Notes & Question Banks!";

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white text-xs md:text-sm font-medium py-2 px-3 sm:px-6 relative z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span className="truncate">{defaultText}</span>
          <Link
            href="/browse"
            className="underline hover:text-amber-300 font-semibold shrink-0 ml-1 hidden sm:inline"
          >
            Claim Offer →
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://t.me/compx_notes"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition"
            title="Join Telegram Channel"
          >
            <Send className="w-3 h-3 text-sky-300" />
            <span>Telegram</span>
          </a>
          <a
            href="https://chat.whatsapp.com/CDeKmgE9qY97JgJeOVjUTQ"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs bg-emerald-500/30 hover:bg-emerald-500/50 px-2 py-0.5 rounded transition text-emerald-200"
            title="Join WhatsApp Group"
          >
            <MessageCircle className="w-3 h-3 text-emerald-300" />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => setVisible(false)}
            className="text-white/70 hover:text-white p-0.5 rounded transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

