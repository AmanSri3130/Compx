"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderLock,
  Download,
  Printer,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import confetti from "canvas-confetti";

export function OrderConfirmationClient({ order }: { order: any }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (order.status === "PAID") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [order.status]);

  // Periodic polling for status changes if pending verification
  useEffect(() => {
    if (currentStatus === "PENDING" || currentStatus === "PENDING_VERIFICATION") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/account/orders`);
          if (res.ok) {
            const data = await res.json();
            const matching = data.orders?.find((o: any) => o.id === order.id);
            if (matching && matching.status !== currentStatus) {
              setCurrentStatus(matching.status);
              if (matching.status === "PAID") {
                try {
                  confetti({ particleCount: 100, spread: 80 });
                } catch {}
              }
            }
          }
        } catch {}
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [currentStatus, order.id]);

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

  const isPaid = currentStatus === "PAID";
  const isPending = currentStatus === "PENDING_VERIFICATION" || currentStatus === "PENDING";
  const isRejected = currentStatus === "REJECTED";

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-5">
          
          {isPaid && (
            <>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Payment Verified & Order Unlocked!
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                Thank you, <strong>{order.customerName}</strong>! Your study notes are now activated in your personal CompX library for lifetime download & viewing.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/account/library"
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2 transition hover:scale-105"
                >
                  <FolderLock className="w-4 h-4" />
                  <span>Go to My Library</span>
                </Link>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-sm rounded-xl flex items-center gap-2 transition no-print"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Invoice</span>
                </button>
              </div>
            </>
          )}

          {isPending && (
            <>
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm animate-pulse">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
                  Status: Verification in Progress
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
                  We are Verifying Your Payment
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Order <strong className="text-indigo-600">#{order.id}</strong> is received. Our academic team is matching your UTR (<strong>{order.payment?.utr || "Submitted"}</strong>). Notes usually unlock within <strong>5–15 minutes</strong>.
              </p>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 max-w-md mx-auto space-y-2">
                <p>💡 This page checks status automatically. You don't need to refresh.</p>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello CompX Admin, I placed Order #${order.id} for ₹${order.finalAmount}. Please verify my UTR: ${order.payment?.utr || ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notify Admin on WhatsApp for Instant Priority Unlock →</span>
                </a>
              </div>
            </>
          )}

          {isRejected && (
            <>
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Payment Verification Failed
              </h1>
              <p className="text-sm text-rose-600 max-w-md mx-auto">
                {order.rejectionReason || "The UTR or screenshot submitted could not be verified by our banking system."}
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20CompX,%20my%20order%20${order.id}%20was%20rejected`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact WhatsApp Support for Manual Unlock</span>
                </a>
              </div>
            </>
          )}
        </div>

        {/* Printable Tax Invoice Container */}
        <div id="invoice" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Comp<span className="text-indigo-600">X</span>
                </span>
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                  TAX INVOICE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Study smart. Score higher.</p>
              <p className="text-xs text-slate-400">GSTIN / Registration: COMPX-EDU-2026</p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <p><strong>Invoice No:</strong> {order.id}</p>
              <p><strong>Date:</strong> {formatDateTime(order.createdAt)}</p>
              <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-800 dark:text-white">Billed To (Student):</p>
            <p>{order.customerName}</p>
            <p>{order.customerEmail}</p>
            {order.customerPhone && <p>{order.customerPhone}</p>}
          </div>

          {/* Ordered Notes Table */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Study Material / Item</th>
                  <th className="p-3.5 text-center">Format</th>
                  <th className="p-3.5 text-right">Price</th>
                  {isPaid && <th className="p-3.5 text-right no-print">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="p-3.5 text-center text-slate-400">PDF</td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {item.price === 0 ? "FREE" : formatPrice(item.price)}
                    </td>
                    {isPaid && (
                      <td className="p-3.5 text-right no-print">
                        <button
                          onClick={() => handleDownloadNote(item.noteId)}
                          disabled={downloadingId === item.noteId}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg inline-flex items-center gap-1 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === item.noteId ? "..." : "Download"}</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2 text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Grand Total Paid</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

