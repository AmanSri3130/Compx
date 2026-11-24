"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ChevronDown,
  BookOpen,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";

export default function BrowsePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <BrowsePage />
    </Suspense>
  );
}

function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all"); // "all", "free", "paid"
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "popular");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const categoriesList = [
    { id: "all", name: "All Categories" },
    { id: "school", name: "School (Class 6 - 12)" },
    { id: "class-10", name: "Class 10 Board" },
    { id: "class-12-science", name: "Class 12 Science" },
    { id: "engineering-medical-entrance", name: "Engineering & Medical" },
    { id: "jee-main-advanced", name: "JEE Main & Advanced" },
    { id: "neet-ug", name: "NEET UG" },
    { id: "government-civil-services", name: "UPSC & Civil Services" },
    { id: "upsc-cse", name: "UPSC CSE Prelims/Mains" },
    { id: "ssc-exams", name: "SSC (CGL, CHSL)" },
    { id: "defence-exams", name: "Defence (NDA, CDS)" },
    { id: "btech-engineering", name: "B.Tech (All Branches)" },
    { id: "btech-cse-it", name: "B.Tech CSE & IT" },
    { id: "graduation-masters", name: "Graduation & Masters" },
  ];

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedType && selectedType !== "all") params.set("type", selectedType);
      if (selectedSort) params.set("sort", selectedSort);
      if (selectedLanguage && selectedLanguage !== "all") params.set("language", selectedLanguage);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "24");

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error("Browse fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedType, selectedSort, selectedLanguage, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Sync state if URL query changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const t = searchParams.get("type");
    if (t) setSelectedType(t);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedSort("popular");
    setSelectedLanguage("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    selectedLanguage !== "all" ||
    Boolean(searchQuery);

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Explore Study Notes & Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Handwritten topper notes, formula booklets, and PYQ solutions for School, Entrance & Govt Exams.
          </p>
        </div>

        {/* Filter & Sort Bar (Top) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search inside catalog */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this category..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 ml-1" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Filter Notes</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Free vs Paid Type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Resource Type
              </p>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {[
                  { id: "all", label: "All" },
                  { id: "free", label: "Free" },
                  { id: "paid", label: "Paid" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      selectedType === t.id
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Exam / Stream
              </p>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {selectedCategory === cat.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Medium / Language
              </p>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Languages" },
                  { id: "English", label: "English Only" },
                  { id: "Hinglish", label: "Hinglish (Bilingual)" },
                  { id: "Hindi", label: "Hindi Medium" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                      selectedLanguage === lang.id
                        ? "bg-indigo-50 text-indigo-600 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Notes Grid Main Area */}
          <main className="lg:col-span-3">
            {/* Active Filters Pill Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-slate-400 font-medium">Active filters:</span>
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Category: {categoriesList.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                    <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                  </span>
                )}
                {selectedType !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    Type: {selectedType.toUpperCase()}
                    <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedType("all")} />
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
                    Query: "{searchQuery}"
                    <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </span>
                )}
              </div>
            )}

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>Showing {notes.length} note(s)</span>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-80 animate-pulse p-4 space-y-4"
                  >
                    <div className="bg-slate-200 dark:bg-slate-800 h-40 rounded-xl" />
                    <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
                    <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                  📚
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No notes match your filters
                </h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search query, selecting "All Categories", or removing the price filter.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden flex justify-end animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free vs Paid */}
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Resource Type</p>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {["all", "free", "paid"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`py-1.5 text-xs font-bold rounded-lg ${
                        selectedType === t
                          ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Category</p>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                        selectedCategory === cat.id
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

