import React from "react";
import { notFound } from "next/navigation";
import { getMasterAdminSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "CompX Command Console | Master Management",
  robots: "noindex, nofollow, noarchive",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMasterAdminSession();

  // Stealth Security Guard:
  // If not authenticated via the dedicated master admin token, render 404!
  // To all outside visitors, students, or scanners, /admin literally does not exist.
  if (!session || !isAdmin(session)) {
    notFound();
  }

  // Fetch pending verifications count and recent notifications
  let pendingCount = 0;
  let notifications: any[] = [];
  try {
    const [pCount, notifs] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.notification.findMany({
        where: { userId: null },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    pendingCount = pCount;
    notifications = notifs;
  } catch {}

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <AdminSidebar pendingOrders={pendingCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader pendingCount={pendingCount} notifications={notifications} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}

