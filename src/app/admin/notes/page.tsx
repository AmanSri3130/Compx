"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/notes${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      if (res.ok) {
        const json = await res.json();
        setNotes(json.notes || []);
      }
    } catch (e) {
      console.error("Notes fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete note "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotes();
      } else {
        alert("Failed to delete note");
      }
    } catch {
      alert("Delete request failed");
    }
  };

  const handleTogglePublish = async (note: any) => {
    const newStatus = note.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, status: newStatus }),
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Notes Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish, edit, price, and watermark academic notes & formula sheets
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Note</span>
        </Link>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchNotes()}
            placeholder="Search notes by title, subject, tags..."
            className="w-full bg-slate-800 text-xs text-white rounded-xl pl-9 pr-8 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Cover & Title</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Downloads / Sales</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading notes...
                  </td>
                </tr>
              ) : notes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No notes found. Click "Upload New Note" to add one!
                  </td>
                </tr>
              ) : (
                notes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={note.coverImage}
                        alt={note.title}
                        className="w-12 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/notes/${note.slug}`}
                          target="_blank"
                          className="font-bold text-white hover:text-indigo-400 flex items-center gap-1 line-clamp-1"
                        >
                          <span>{note.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                        </Link>
                        <p className="text-[10px] text-slate-400">
                          {note.pagesCount} Pages • {note.author || "CompX Faculty"}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">
                      <span className="font-semibold">{note.category?.name || "General"}</span>
                      {note.subject && <p className="text-[10px] text-slate-500">{note.subject}</p>}
                    </td>

                    <td className="p-4 text-right font-black text-white">
                      {note.isFree ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        formatPrice(note.price)
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(note)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                          note.status === "PUBLISHED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {note.status}
                      </button>
                    </td>

                    <td className="p-4 text-center text-slate-300 font-mono">
                      {note.downloadsCount} / {note.salesCount}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/notes/${note.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Note"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(note.id, note.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

