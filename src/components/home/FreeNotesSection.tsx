import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Download } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";

export function FreeNotesSection({ freeNotes = [] }: { freeNotes: any[] }) {
  if (freeNotes.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-emerald-50/50 dark:bg-emerald-950/20 border-y border-emerald-100 dark:border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Cost Resources</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Free Notes & Formula Sheets
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Download premium quality revision sheets, formulas, and proofs completely free of charge.
            </p>
          </div>

          <Link
            href="/browse?type=free"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:underline group shrink-0"
          >
            <span>View All Free Notes ({freeNotes.length}+)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeNotes.slice(0, 3).map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </section>
  );
}

