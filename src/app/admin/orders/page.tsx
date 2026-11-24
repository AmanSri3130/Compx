"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedMode, setSelectedMode] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Inspection Modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [copiedUtr, setCopiedUtr] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedMode !== "ALL") params.set("paymentMode", selectedMode);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders || []);
      }
    } catch (e) {
      console.error("Orders fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedMode]);

  const handleAction = async (action: "APPROVE" | "REJECT" | "REFUND", orderId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          orderId,
          reason: rejectionReason,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed");
      } else {
        alert(data.message || `Order #${orderId} updated!`);
        setActiveOrder(null);
        setRejectionReason("");
        setAdminNotes("");
        fetchOrders();
      }
    } catch {
      alert("Network error processing order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Orders & UPI Payments</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verify student UPI UTRs, inspect payment screenshots, approve notes unlocking
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            placeholder="Search by Order ID, UTR, student email..."
            className="w-full bg-slate-800 text-xs text-white rounded-xl pl-9 pr-8 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_VERIFICATION">⏳ Pending Verification</option>
            <option value="PAID">✅ Paid</option>
            <option value="REJECTED">❌ Rejected</option>
            <option value="REFUNDED">↩️ Refunded</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Modes</option>
            <option value="UPI_QR">UPI QR Code</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="GATEWAY_RAZORPAY">Razorpay</option>
          </select>

          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Mode</th>
                <th className="p-4">UTR / Screenshot</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPending = order.status === "PENDING_VERIFICATION";
                  const hasScreenshot = Boolean(order.payment?.screenshotUrl);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <p className="font-mono font-bold text-white">{order.id}</p>
                        <p className="text-[10px] text-slate-500">{formatDateTime(order.createdAt)}</p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-200">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                        {order.customerPhone && (
                          <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                        )}
                      </td>

                      <td className="p-4 text-slate-300 font-medium">{order.paymentMode}</td>

                      <td className="p-4">
                        {order.payment?.utr ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300">
                            <span>{order.payment.utr}</span>
                            <button
                              onClick={() => handleCopy(order.payment.utr)}
                              className="text-slate-500 hover:text-white"
                              title="Copy UTR"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not submitted</span>
                        )}

                        {hasScreenshot && (
                          <span className="inline-block mt-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                            Screenshot Attached
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right font-black text-sm text-white">
                        {formatPrice(order.finalAmount)}
                      </td>

                      <td className="p-4 text-center">
                        {order.status === "PAID" ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            PAID
                          </span>
                        ) : isPending ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">
                            VERIFY UTR
                          </span>
                        ) : order.status === "REJECTED" ? (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            REJECTED
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                            {order.status}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveOrder(order);
                              setAdminNotes(order.adminNotes || "");
                            }}
                            className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs transition"
                          >
                            Inspect & Action
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action & Screenshot Inspection Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                  {activeOrder.id}
                </span>
                <h3 className="text-lg font-black text-white mt-1">Payment Verification & Order Action</h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Student & Payment Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <div>
                <p className="text-slate-400">Student Name:</p>
                <p className="font-bold text-white text-sm">{activeOrder.customerName}</p>
                <p className="text-slate-400 mt-1">Email:</p>
                <p className="text-slate-200">{activeOrder.customerEmail}</p>
              </div>

              <div>
                <p className="text-slate-400">Order Amount:</p>
                <p className="font-black text-emerald-400 text-base">{formatPrice(activeOrder.finalAmount)}</p>
                <p className="text-slate-400 mt-1">Submitted UTR:</p>
                <p className="font-mono font-bold text-amber-300 text-sm">
                  {activeOrder.payment?.utr || "No UTR Entered"}
                </p>
              </div>
            </div>

            {/* Payment Screenshot Inspection (Mode A) */}
            {activeOrder.payment?.screenshotUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Uploaded Payment Screenshot:</p>
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center">
                  <img
                    src={activeOrder.payment.screenshotUrl}
                    alt="Payment receipt screenshot"
                    className="max-h-64 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400 italic">
                No screenshot was attached with this order.
              </div>
            )}

            {/* Notes Purchased */}
            <div>
              <p className="text-xs font-bold text-slate-300 mb-1">Notes in this order:</p>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                {activeOrder.items?.map((item: any) => (
                  <li key={item.id} className="text-slate-300 font-medium">
                    {item.title} ({formatPrice(item.price)})
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Internal Notes (Optional)
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Verified via ICICI Bank portal on 14 Nov"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Rejection Reason if rejecting */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Rejection Reason (Sent to student if rejected)
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR not found in bank statement, amount mismatch"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleAction("REFUND", activeOrder.id)}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Mark Refunded
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction("REJECT", activeOrder.id)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition"
                >
                  Reject Payment
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("APPROVE", activeOrder.id)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? "Processing..." : "Approve & Unlock Notes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

