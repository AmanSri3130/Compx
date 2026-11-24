"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, ShieldCheck, Zap, ArrowRight, Download, Users, BookOpen } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const trendingTags = [
    { label: "Class 10 Science", q: "Class 10 Science" },
    { label: "JEE Physics Formulas", q: "JEE Physics" },
    { label: "UPSC Modern History", q: "UPSC History" },
    { label: "NEET Biology Diagrams", q: "NEET Biology" },
    { label: "DSA Notes", q: "DSA" },
    { label: "NDA Maths Tricks", q: "NDA Maths" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100 dark:border-slate-800">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 blur-3xl">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter" />
        <div className="absolute top-32 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 text-xs sm:text-sm font-bold mb-6 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Exam Season 2026: 500+ New Topper Notes Added</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Study Smart. <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">Score Higher.</span>
        </h1>

        {/* Tagline / Subtitle */}
        <p className="mt-4 sm:mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          India's most trusted marketplace for handwritten topper notes, Kota formula cheat sheets, and university semester materials. Instant PDF download on UPI & WhatsApp.
        </p>

        {/* Large Central Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/10 border-2 border-indigo-100 dark:border-slate-700 p-2 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 transition-all"
          >
            <Search className="w-6 h-6 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by exam, subject or topic (e.g. JEE Physics, UPSC History, Class 10)..."
              className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 sm:px-7 py-3 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shrink-0 transition-transform hover:scale-[1.02] shadow-md shadow-indigo-500/20"
            >
              Search
            </button>
          </form>

          {/* Trending Search Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-400 mr-1">Trending:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag.q)}`)}
                className="bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full transition text-[11px] font-medium"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/browse"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition"
          >
            <span>Explore All Notes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/browse?type=free"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Free Notes</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-14 pt-10 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">50,000+</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Indian Students Helped</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">1,200+</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Verified Topper Notes</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-orange-500">4.9 / 5</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Average Student Rating</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">Instant</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">UPI & WhatsApp Delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}

