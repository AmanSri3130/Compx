"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  Users,
  FileText,
  Download,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-900 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    revenue = { allTime: 0, today: 0, week: 0, month: 0 },
    orders = { totalPaid: 0, pendingVerification: 0 },
    students = { total: 0 },
    notes = { total: 0, free: 0, paid: 0 },
    downloads = { total: 0, free: 0, paid: 0 },
    recentOrders = [],
    categorySales = [],
    chartData = [],
  } = data || {};

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Academic Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time overview of revenue, UPI payments, and student downloads
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/notes/new"
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            + Upload New Note
          </Link>
          <Link
            href="/admin/orders?status=PENDING_VERIFICATION"
            className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-500/20 transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Verify UTRs ({orders.pendingVerification})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Revenue Today & All-Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{formatPrice(revenue.allTime)}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-bold">+{formatPrice(revenue.today)}</span>
              <span>today</span>
              <span>•</span>
              <span className="text-indigo-400 font-bold">{formatPrice(revenue.week)}</span>
              <span>this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders & Pending Verification Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Orders</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{orders.totalPaid}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              {orders.pendingVerification > 0 ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {orders.pendingVerification} pending review
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">All payments verified</span>
              )}
            </p>
          </div>
        </div>

        {/* Card 3: Notes & Free/Paid Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Notes Library</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{notes.total}</h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-slate-200">{notes.paid}</strong> Paid •{" "}
              <strong className="text-emerald-400">{notes.free}</strong> Free Resources
            </p>
          </div>
        </div>

        {/* Card 4: Students & Downloads */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Student Reach</span>
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{students.total}</h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-white">{downloads.total}</strong> Total PDF downloads
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Chart & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-Day Sales Trend Visualizer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Last 7 Days Revenue Trend</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">{formatPrice(revenue.week)} this week</span>
          </div>

          {/* Simple Clean Bar Chart Representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {chartData.map((item: any, i: number) => {
              const maxRev = Math.max(...chartData.map((d: any) => d.revenue), 100);
              const heightPct = Math.max(12, Math.round((item.revenue / maxRev) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-blue-700 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-400 rounded-t-xl transition-all shadow-md"
                  />
                  <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
            Top Categories by Sales
          </h3>

          <div className="space-y-3.5 text-xs">
            {categorySales.map((cat: any) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300 truncate max-w-[160px]">{cat.name}</span>
                  <span className="text-white font-bold">{formatPrice(cat.sales)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(15, (cat.sales / (revenue.allTime || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-sm text-white">Recent Orders & Transactions</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Orders ({orders.totalPaid})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Payment Mode</th>
                <th className="pb-3">UTR / Ref</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-800/40">
                  <td className="py-3 font-mono font-bold text-slate-200">{order.id}</td>
                  <td className="py-3 text-slate-300">
                    <p className="font-bold">{order.customerName}</p>
                    <p className="text-[10px] text-slate-500">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 text-slate-400">{order.paymentMode}</td>
                  <td className="py-3 font-mono text-[11px] text-indigo-300">
                    {order.payment?.utr || "Pending"}
                  </td>
                  <td className="py-3 text-right font-black text-white">
                    {formatPrice(order.finalAmount)}
                  </td>
                  <td className="py-3 text-center">
                    {order.status === "PAID" ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        PAID
                      </span>
                    ) : order.status === "PENDING_VERIFICATION" ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                        VERIFY UTR
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/orders?search=${order.id}`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg transition"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

