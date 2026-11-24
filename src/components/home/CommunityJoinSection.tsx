import React from "react";
import { MessageCircle, Send, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function CommunityJoinSection() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 mb-4 border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>Join 25,000+ Active Aspirants</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Get Daily Free Notes & Exam Alerts in Your Pocket
            </h2>

            <p className="mt-3 text-sm sm:text-base text-indigo-100 max-w-xl leading-relaxed">
              Join our official student discussion channels. Receive free daily formula sheets, CBSE & NTA updates, and secret topper tips directly on WhatsApp and Telegram.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {/* WhatsApp Card */}
              <a
                href="https://chat.whatsapp.com/CDeKmgE9qY97JgJeOVjUTQ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-500/40 shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">Join WhatsApp Community</h4>
                    <p className="text-xs text-emerald-100">Daily Topper Notes & Updates</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Telegram Card */}
              <a
                href="https://t.me/compx_notes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-sky-600/90 hover:bg-sky-600 border border-sky-500/40 shadow-lg hover:shadow-sky-500/20 transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">Join Telegram Channel</h4>
                    <p className="text-xs text-sky-100">PDFs, PYQs & Revision Maps</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-sky-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No spam guaranteed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Free study material
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct mentor interaction
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

