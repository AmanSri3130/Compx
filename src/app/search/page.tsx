"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Clock, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFreeFilter, setIsFreeFilter] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("compx_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("compx_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const executeSearch = useCallback(
    async (searchTerm: string, freeOnly = isFreeFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        if (freeOnly) params.set("isFree", "true");
        params.set("limit", "20");

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.notes || []);
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [isFreeFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, isFreeFilter);
      if (query.trim()) {
        saveRecentSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isFreeFilter, executeSearch]);

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("compx_recent_searches");
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Large Search Input */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, subjects, authors, exams (e.g. JEE Physics, Class 10 Science, DSA)..."
              autoFocus
              className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-white text-base sm:text-lg rounded-2xl pl-12 pr-12 py-3.5 shadow-xl shadow-indigo-500/5 focus:outline-none focus:border-indigo-600 transition"
            />
            <Search className="w-5 h-5 text-indigo-600 absolute left-4 top-4" />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Filter:</span>
              <button
                onClick={() => setIsFreeFilter(!isFreeFilter)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 ${
                  isFreeFilter
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Notes Only</span>
              </button>

              {["Class 10", "JEE Main", "UPSC History", "B.Tech CSE", "NEET Biology"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setQuery(chip)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {recentSearches.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent:</span>
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectRecent(r)}
                    className="hover:text-indigo-600 underline ml-1"
                  >
                    {r}
                  </button>
                ))}
                <button
                  onClick={handleClearRecent}
                  className="text-rose-500 hover:underline ml-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Matching Categories suggestions */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Matching Categories
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/browse?category=${c.slug}`)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-white text-xs font-bold rounded-xl shadow-sm transition group"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>{c.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {query ? `Search results for "${query}"` : "Popular & Trending Notes"}
          </h2>
          <span className="text-xs text-slate-500">{results.length} result(s) found</span>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-72 animate-pulse p-4 space-y-3"
              >
                <div className="bg-slate-200 dark:bg-slate-800 h-36 rounded-xl" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No results found for "{query}"
            </h3>
            <p className="text-xs text-slate-500">
              Try searching with broader terms, e.g. "Physics", "Maths", "UPSC", or browse our categories.
            </p>
            <button
              onClick={() => router.push("/browse")}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition"
            >
              Browse All Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

