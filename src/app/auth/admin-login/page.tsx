"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid administrator credentials");
        setLoading(false);
      } else {
        // Force full page navigation so admin session cookie is picked up by server layout
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError("Network or server connection failed. Please retry.");
      setLoading(false);
    }
  };

  const handleQuickFill = (adminEmail: string, adminPass: string) => {
    setEmail(adminEmail);
    setPassword(adminPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">CompX Command Center</h1>
          <p className="text-xs text-slate-400">Master Administrator & Management Console</p>
        </div>

        {/* Security Alert Badge */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs flex items-center gap-2.5 text-slate-300 relative z-10">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Restricted system. Student accounts are blocked from accessing this gateway.</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 text-rose-300 border border-rose-800 rounded-xl text-xs flex items-center gap-2 relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@compx.in"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Master Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition duration-200 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Master Credentials...
              </span>
            ) : (
              <>
                <span>Access Command Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper for Admin */}
        <div className="pt-4 border-t border-slate-800/80 relative z-10">
          <p className="text-[10px] text-slate-500 text-center mb-2 font-medium">Quick Credentials for System Administrator:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("superadmin@compx.in", "SuperAdmin@123")}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition"
            >
              <div className="text-[11px] font-bold text-amber-400">Master Admin</div>
              <div className="text-[10px] text-slate-400 truncate">superadmin@compx.in</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("academic@compx.in", "Academic@123")}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition"
            >
              <div className="text-[11px] font-bold text-indigo-400">Academic Admin</div>
              <div className="text-[10px] text-slate-400 truncate">academic@compx.in</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
