"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PackageCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderLock,
  Download,
  ShieldCheck,
  MessageCircle,
  FileText,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadOrders = async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Orders load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadOrders();
    }
  }, [authLoading]);

  // Auto-poll every 10 seconds if any order is pending verification
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === "PENDING_VERIFICATION" || o.status === "PENDING");
    if (!hasPending) return;

    const interval = setInterval(() => {
      loadOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleDownloadNote = async (noteId: string) => {
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
        alert(data.error || "Failed to download note. Please ensure payment is approved.");
      }
    } catch {
      alert("Download error");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Orders & Payment Tracking
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live status of your study material orders and manual payment verifications
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
            </button>
            <Link
              href="/account/library"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>Go to My Library</span>
            </Link>
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">No Orders Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our verified topper notes, Kota formula sheets, and chapter revision PDFs.
            </p>
            <Link
              href="/browse"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Browse Notes Store →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPaid = order.status === "PAID";
              const isPending = order.status === "PENDING_VERIFICATION" || order.status === "PENDING";
              const isRejected = order.status === "REJECTED";
              const hasUtr = Boolean(order.payment?.utr);

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 transition-all hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          Order #{order.id}
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                          {order.paymentMode === "UPI_QR" ? "UPI QR" : order.paymentMode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Placed on {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                          {formatPrice(order.finalAmount)}
                        </p>
                      </div>

                      <Link
                        href={`/order-confirmation/${order.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                      >
                        <span>Receipt</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Tracker */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Order Progression Tracking
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Step 1: Placed */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">1. Order Placed</p>
                          <p className="text-[10px] text-slate-400">Registered in system</p>
                        </div>
                      </div>

                      {/* Step 2: Payment Submitted */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm ${
                            hasUtr
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {hasUtr ? "✓" : "2"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">2. Proof Submitted</p>
                          <p className="text-[10px] text-slate-400">
                            {hasUtr ? `UTR: ${order.payment?.utr}` : "Waiting for UTR"}
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Admin Manual Verification */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm ${
                            isPaid
                              ? "bg-emerald-500 text-white"
                              : isRejected
                              ? "bg-rose-500 text-white"
                              : isPending
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {isPaid ? "✓" : isRejected ? "✕" : isPending ? "⏳" : "3"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">3. Admin Verification</p>
                          <p className="text-[10px] text-slate-400">
                            {isPaid
                              ? "Approved by Admin"
                              : isRejected
                              ? "Verification Failed"
                              : isPending
                              ? "Under Admin Review"
                              : "Pending"}
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Notes Unlocked */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm ${
                            isPaid
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {isPaid ? "📚" : "4"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">4. Notes Access</p>
                          <p className="text-[10px] text-slate-400">
                            {isPaid ? "Unlocked in Library" : "Locked"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {isPending && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
                      <div className="flex-1">
                        <p className="font-bold">Payment Under Manual Review by Admin</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                          Your UTR is submitted. The admin is manually verifying your payment in the bank records. Once verified, your notes will unlock automatically.
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/919876543210?text=Hi%20Admin%20I%20placed%20Order%20${order.id}%20with%20UTR%20${order.payment?.utr || ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-sm transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Speed up on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold">Payment Verification Rejected</p>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                          {order.adminNotes || "The UTR or screenshot could not be matched with bank statements. Please contact support to resolve."}
                        </p>
                      </div>
                    </div>
                  )}

                  {isPaid && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold">Payment Verified & Approved!</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          All PDF notes are permanently unlocked in your personal library.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Purchased Items List & Actions */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Purchased Items ({order.items?.length || 0}):
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800"
                        >
                          <img
                            src={item.note?.coverImage || "/placeholder-note.png"}
                            alt={item.title}
                            className="w-12 h-14 object-cover rounded-xl shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {isPaid && item.note && (
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/account/library`}
                                className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl transition"
                                title="Read Online"
                              >
                                <FolderLock className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDownloadNote(item.note.id)}
                                disabled={downloadingId === item.note.id}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl transition disabled:opacity-50"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
