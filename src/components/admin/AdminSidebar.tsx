"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  CreditCard,
  Users,
  Tag,
  Star,
  Globe,
  Settings,
  History,
  GraduationCap,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar({ pendingOrders = 0 }: { pendingOrders?: number }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Notes Manager", href: "/admin/notes", icon: FileText },
    { label: "Categories Tree", href: "/admin/categories", icon: FolderTree },
    {
      label: "Orders & UPI Payments",
      href: "/admin/orders",
      icon: CreditCard,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
    },
    { label: "Students & Roles", href: "/admin/users", icon: Users },
    { label: "Discount Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Reviews & Messages", href: "/admin/reviews", icon: Star },
    { label: "Website CMS", href: "/admin/cms", icon: Globe },
    { label: "Payment & UPI Settings", href: "/admin/settings", icon: Settings },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white tracking-tight text-lg">CompX</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Management Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Exit */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Public Site</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-amber-400 capitalize">{user?.role?.toLowerCase() || "Staff"}</p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/admin-logout", { method: "POST" });
              } catch (e) {}
              window.location.href = "/";
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

