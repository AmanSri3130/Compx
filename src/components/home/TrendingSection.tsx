"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";

export function TrendingSection({ notes = [] }: { notes: any[] }) {
  const [filter, setFilter] = useState("all");

  const filteredNotes = notes.filter((n) => {
    if (filter === "all") return true;
    if (filter === "school") return n.category?.slug?.includes("school") || n.subCategory?.toLowerCase().includes("class");
    if (filter === "entrance") return n.category?.slug?.includes("engineering") || n.subCategory?.toLowerCase().includes("jee") || n.subCategory?.toLowerCase().includes("neet");
    if (filter === "govt") return n.category?.slug?.includes("government") || n.subCategory?.toLowerCase().includes("upsc") || n.subCategory?.toLowerCase().includes("ssc") || n.subCategory?.toLowerCase().includes("nda");
    if (filter === "btech") return n.category?.slug?.includes("btech") || n.subCategory?.toLowerCase().includes("cse") || n.subject?.toLowerCase().includes("dsa");
    return true;
  });

  return (
    <section className="py-12 sm:py-16 bg-slate-50/60 dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-300 px-2.5 py-1 rounded-md mb-2">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Most Popular This Week</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Trending & Bestseller Notes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Handwritten notes preferred by thousands of high scorers across India
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0 no-scrollbar">
            {[
              { id: "all", label: "All Notes" },
              { id: "school", label: "Class 10 & 12" },
              { id: "entrance", label: "JEE & NEET" },
              { id: "govt", label: "UPSC & Defence" },
              { id: "btech", label: "B.Tech & Coding" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  filter === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.slice(0, 8).map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition group"
          >
            <span>Explore All 1,200+ Notes</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

