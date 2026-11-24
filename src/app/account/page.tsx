"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Download,
  FolderLock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Sparkles,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [libraryNotes, setLibraryNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Study Time Tracker State (persistent in localStorage)
  const [studySeconds, setStudySeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Auth Guard: Only logged-in students allowed
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?returnTo=/account");
    }
  }, [user, authLoading, router]);

  // Load persistent study time
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("compx_study_time_seconds");
      if (savedTime) {
        setStudySeconds(parseInt(savedTime, 10) || 0);
      }
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudySeconds((prev) => {
          const next = prev + 1;
          if (typeof window !== "undefined" && next % 5 === 0) {
            localStorage.setItem("compx_study_time_seconds", next.toString());
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Fetch Orders and Library Data
  const loadDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [ordersRes, libraryRes] = await Promise.all([
        fetch("/api/account/orders"),
        fetch("/api/account/library"),
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }
      if (libraryRes.ok) {
        const lData = await libraryRes.json();
        setLibraryNotes(lData.notes || []);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Auto poll every 10s if any order is pending verification
  useEffect(() => {
    const hasPending = orders.some(
      (o) => o.status === "PENDING_VERIFICATION" || o.status === "PENDING"
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      loadDashboardData(false);
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
        alert(data.error || "Failed to download note");
      }
    } catch {
      alert("Download error");
    } finally {
      setDownloadingId(null);
    }
  };

  // Helper formatting for study time
  const formatStudyTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING_VERIFICATION" || o.status === "PENDING"
  );
  const completedOrders = orders.filter((o) => o.status === "PAID");

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Hero Banner & Access to Store */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/10">
              <GraduationCap className="w-4 h-4" />
              <span>Student Aspirant Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.name || "Student"}! 🎓
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Track your unlocked notes, active UPI verifications, previous orders, and study time in one unified dashboard.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href="/browse"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore & Buy Notes Store →</span>
            </Link>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition border border-white/10"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Unlocked Notes */}
          <Link
            href="/account/library"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Unlocked Notes
              </span>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-110 transition-transform">
                <FolderLock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
              {libraryNotes.length}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
              <span>View in Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          {/* Card 2: Total Orders */}
          <Link
            href="/account/orders"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Orders
              </span>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-110 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
              {orders.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
              <span>Order Receipts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          {/* Card 3: Active Verifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Verifying
              </span>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">
              {pendingOrders.length}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {pendingOrders.length > 0 ? "Under Admin Review" : "All Verified"}
            </p>
          </div>

          {/* Card 4: Study Time Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Study Time Spent
              </span>
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatStudyTime(studySeconds)}
            </p>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                  isTimerRunning
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isTimerRunning ? "Pause Study" : "Start Study Session"}</span>
              </button>
              {studySeconds > 0 && (
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setStudySeconds(0);
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("compx_study_time_seconds");
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Payment Verification Pipeline (If any pending orders) */}
        {pendingOrders.length > 0 && (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                <h3 className="font-black text-base text-amber-900 dark:text-amber-200">
                  Live Payment Verification in Progress ({pendingOrders.length})
                </h3>
              </div>
              <span className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold px-2.5 py-0.5 rounded-full">
                Auto-Updating
              </span>
            </div>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-200/80 dark:border-amber-800/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white">
                        Order #{order.id} • {formatPrice(order.finalAmount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Submitted UTR: <strong className="font-mono text-amber-600">{order.payment?.utr || "Pending"}</strong>
                      </p>
                    </div>
                    <Link
                      href={`/order-confirmation/${order.id}`}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs rounded-xl self-start sm:self-auto"
                    >
                      Track Order Details →
                    </Link>
                  </div>

                  {/* 4-Step Pipeline */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                      <span>1. Order Placed</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                      <span>2. UTR Submitted</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-bold animate-pulse">
                      <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">⏳</span>
                      <span>3. Admin Verifying</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">4</span>
                      <span>4. Unlock Notes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: My Unlocked Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                My Unlocked Study Notes ({libraryNotes.length})
              </h2>
            </div>
            <Link
              href="/browse"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>+ Get More Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {libraryNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">
                You haven't unlocked any notes yet. Free notes and purchased notes will appear here automatically.
              </p>
              <Link
                href="/browse"
                className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Browse Free & Paid Notes →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {libraryNotes.slice(0, 6).map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={note.coverImage || "/placeholder-note.png"}
                      alt={note.title}
                      className="w-14 h-18 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                        {note.category?.name || "Academic Note"}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 truncate">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {note.pagesCount} Pages • {note.format}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/notes/${note.slug}`}
                      className="py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-xl text-center transition"
                    >
                      Read Online
                    </Link>
                    <button
                      onClick={() => handleDownloadNote(note.id)}
                      disabled={downloadingId === note.id}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingId === note.id ? "Preparing..." : "Download"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Previous Orders & Receipts */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Previous Orders & Receipts ({orders.length})
              </h2>
            </div>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center text-xs text-slate-500">
              No orders placed yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 5).map((order) => {
                      const isPaid = order.status === "PAID";
                      const isPending = order.status === "PENDING_VERIFICATION" || order.status === "PENDING";
                      const isRejected = order.status === "REJECTED";

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            #{order.id}
                          </td>
                          <td className="p-4 text-slate-500">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs truncate font-medium">
                            {order.items?.map((i: any) => i.title).join(", ") || "Notes"}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {formatPrice(order.finalAmount)}
                          </td>
                          <td className="p-4">
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Paid & Active
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                <Clock className="w-3 h-3" /> Verifying UTR
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                                <AlertCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              href={`/order-confirmation/${order.id}`}
                              className="font-bold text-indigo-600 hover:underline"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
