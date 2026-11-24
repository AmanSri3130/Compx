"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderLock,
  Download,
  Eye,
  Search,
  FileText,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { PdfViewerModal } from "@/components/notes/PdfViewerModal";

export default function MyLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // In-browser viewer modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPdfUrl, setViewerPdfUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  useEffect(() => {
    async function loadLibrary() {
      try {
        const res = await fetch("/api/account/library");
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error("Library load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadLibrary();
    }
  }, [authLoading]);

  const handleDownload = async (noteId: string) => {
    setDownloadingId(noteId);
    try {
      const res = await fetch("/api/notes/get-download-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        alert(data.error || "Failed to authorize download");
      }
    } catch {
      alert("Download error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenViewer = async (note: any) => {
    setViewerTitle(note.title);
    try {
      const res = await fetch("/api/notes/get-download-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        setViewerPdfUrl(data.downloadUrl);
        setViewerOpen(true);
      } else {
        alert(data.error || "Failed to load note");
      }
    } catch {
      alert("Viewer load error");
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.subject && n.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <FolderLock className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-xl font-bold">Please Log In</h2>
          <p className="text-xs text-slate-500">Log in with your student account to access your unlocked study materials.</p>
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <FolderLock className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                My Study Library
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All your purchased and downloaded study notes available for re-download anytime.
            </p>
          </div>

          {/* Library Search */}
          {notes.length > 0 && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in your library..."
                className="w-full bg-white dark:bg-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          )}
        </div>

        {/* Content Grid */}
        {notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
              📚
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Library is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't unlocked any notes yet. Browse our library for 100% free formula booklets or purchase high-yield topper notes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
              <Link
                href="/browse?type=free"
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
              >
                Download Free Notes
              </Link>
              <Link
                href="/browse"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Browse All Notes
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={note.coverImage}
                      alt={note.title}
                      className="w-16 h-20 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100 dark:border-slate-800"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {note.category?.name || "Exam Note"}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mt-1">
                        {note.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Unlocked {formatDate(note.unlockedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 py-2 border-y border-slate-100 dark:border-slate-800">
                    <span>{note.pagesCount} Pages</span>
                    <span>•</span>
                    <span>PDF Document</span>
                    <span>•</span>
                    <span>{note.isPurchased ? "Paid Licensed" : "Free Access"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenViewer(note)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Read Online</span>
                  </button>

                  <button
                    onClick={() => handleDownload(note.id)}
                    disabled={downloadingId === note.id}
                    className="py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === note.id ? "Preparing..." : "Download PDF"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Authorized PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerTitle}
        pdfUrl={viewerPdfUrl}
        isSample={false}
      />
    </div>
  );
}

