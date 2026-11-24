"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Mail, CheckCircle2, Trash2, Send, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "messages">("reviews");
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply modal
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews || []);
        setMessages(json.messages || []);
      }
    } catch (e) {
      console.error("Reviews load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      if (res.ok) fetchData();
    } catch {}
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: replyText.trim() }),
      });
      if (res.ok) {
        setReplyingReviewId(null);
        setReplyText("");
        fetchData();
      }
    } catch {}
  };

  const handleUpdateMessageStatus = async (messageId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, messageStatus: status }),
      });
      if (res.ok) fetchData();
    } catch {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Reviews & Student Support Inbox</h1>
          <p className="text-xs text-slate-400 mt-1">
            Moderate student feedback, publish replies, and respond to support queries
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "reviews"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "messages"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Contact Messages ({messages.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-3xl">
              No reviews submitted yet.
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {r.user?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{r.user?.name || "Student"}</p>
                      <p className="text-[10px] text-slate-400">Note: {r.note?.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <button
                      onClick={() => handleToggleApproval(r.id, r.isApproved)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.isApproved
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {r.isApproved ? "Approved" : "Hidden"}
                    </button>
                  </div>
                </div>

                {r.title && <p className="text-xs font-bold text-white">{r.title}</p>}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl">
                  {r.comment}
                </p>

                {/* Admin Reply */}
                {r.adminReply && (
                  <div className="pl-3 border-l-2 border-indigo-500 text-xs text-indigo-300">
                    <strong>CompX Official Reply:</strong> {r.adminReply}
                  </div>
                )}

                {/* Reply Form Trigger */}
                <div className="pt-2 flex items-center justify-end">
                  {replyingReviewId === r.id ? (
                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type official reply to student..."
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSendReply(r.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setReplyingReviewId(null)}
                        className="px-2 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingReviewId(r.id);
                        setReplyText(r.adminReply || "");
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {r.adminReply ? "Edit Official Reply" : "Reply to Review"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Messages */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-3xl">
              No inquiries in inbox.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{m.subject}</h3>
                    <p className="text-xs text-slate-400">
                      From: <strong>{m.name}</strong> ({m.email}) {m.phone && `• ${m.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{formatDate(m.createdAt)}</span>
                    <select
                      value={m.status}
                      onChange={(e) => handleUpdateMessageStatus(m.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 rounded-lg px-2 py-1"
                    >
                      <option value="NEW">New</option>
                      <option value="REPLIED">Replied</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl whitespace-pre-wrap">
                  {m.message}
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                  {m.phone && (
                    <a
                      href={`https://wa.me/${m.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Student</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

