"use client";

import React, { useState, useEffect } from "react";
import { Globe, Plus, Trash2, Edit, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "notice">("pages");
  const [pages, setPages] = useState<any[]>([]);
  const [noticeText, setNoticeText] = useState("");
  const [noticeEnabled, setNoticeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingNotice, setSavingNotice] = useState(false);

  // Edit Page state
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageContent, setPageContent] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [savingPage, setSavingPage] = useState(false);

  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      if (res.ok) {
        const json = await res.json();
        setPages(json.pages || []);
        if (json.settings) {
          setNoticeText(json.settings.noticeBarText || "");
          setNoticeEnabled(json.settings.noticeBarEnabled ?? true);
        }
      }
    } catch (e) {
      console.error("CMS load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotice(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeBarText: noticeText,
          noticeBarEnabled: noticeEnabled,
        }),
      });
      if (res.ok) {
        alert("Notice bar updated successfully!");
      }
    } catch {
      alert("Error saving notice");
    } finally {
      setSavingNotice(false);
    }
  };

  const handleOpenEditPage = (p: any) => {
    setEditingPage(p);
    setPageTitle(p.title);
    setPageContent(p.content);
  };

  const handleSavePage = async () => {
    if (!editingPage) return;
    setSavingPage(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page",
          page: {
            slug: editingPage.slug,
            title: pageTitle,
            content: pageContent,
          },
        }),
      });
      if (res.ok) {
        alert("Page content updated successfully!");
        setEditingPage(null);
        fetchCmsData();
      }
    } catch {
      alert("Error saving page");
    } finally {
      setSavingPage(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Website CMS & Static Pages</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Edit Refund Policy, Terms, About, FAQ, and Homepage Announcement Bar without touching code
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "pages"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Policy & Content Pages ({pages.length})
          </button>
          <button
            onClick={() => setActiveTab("notice")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "notice"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Announcement Bar
          </button>
        </div>
      </div>

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-indigo-500/50 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                  /{p.slug}
                </span>
                <h3 className="font-bold text-white text-base mt-2">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                  {p.content.replace(/<[^>]*>?/gm, "").slice(0, 120)}...
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={`/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  View Live ↗
                </a>
                <button
                  onClick={() => handleOpenEditPage(p)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Edit Page
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Bar Tab */}
      {activeTab === "notice" && (
        <form onSubmit={handleSaveNotice} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-4 text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
            Top Announcement Notice Bar
          </h3>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Notice Bar Text</label>
            <input
              type="text"
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="e.g. 🎉 Big Exam Season Sale: Use coupon 'COMPX50' for flat 50% discount!"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
              <input
                type="checkbox"
                checked={noticeEnabled}
                onChange={(e) => setNoticeEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Enable Notice Bar on Top of Public Website</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={savingNotice}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {savingNotice ? "Saving..." : "Save Announcement Bar"}
            </button>
          </div>
        </form>
      )}

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono">/{editingPage.slug}</span>
                <h3 className="text-base font-bold text-white">Edit Page: {editingPage.title}</h3>
              </div>
              <button onClick={() => setEditingPage(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Page Title</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Page HTML / Markdown Content</label>
                <textarea
                  rows={14}
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                disabled={savingPage}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow"
              >
                {savingPage ? "Saving..." : "Save Page Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

