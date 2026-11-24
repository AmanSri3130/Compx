"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminHeader({
  pendingCount = 0,
  notifications = [],
}: {
  pendingCount?: number;
  notifications?: any[];
}) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      
      {/* Left Alert / Search */}
      <div className="flex items-center gap-3">
        {pendingCount > 0 ? (
          <Link
            href="/admin/orders?status=PENDING_VERIFICATION"
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition animate-pulse"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Payment Verification(s) Pending Review</span>
            <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
              Action
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>All UPI Payments Verified</span>
          </div>
        )}
      </div>

      {/* Right Actions: Public link, Notifications, Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>View Public Store</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl relative transition"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} recent</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <Link
                      key={n.id}
                      href={n.link || "/admin/orders"}
                      className="block p-3 hover:bg-slate-800/80 transition"
                      onClick={() => setShowNotifications(false)}
                    >
                      <p className="font-bold text-white truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                    </Link>
                  ))
                ) : (
                  <p className="p-4 text-center text-slate-500 text-[11px]">No unread alerts</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-white truncate max-w-[120px]">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-amber-400 font-medium capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

