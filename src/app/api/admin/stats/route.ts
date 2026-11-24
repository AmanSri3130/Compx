import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run parallel queries for dashboard
    const [
      allPaidOrders,
      todayPaidOrders,
      weekPaidOrders,
      monthPaidOrders,
      pendingOrdersCount,
      totalStudents,
      totalNotes,
      freeNotesCount,
      paidNotesCount,
      totalDownloads,
      freeDownloads,
      recentOrders,
      categories,
    ] = await Promise.all([
      prisma.order.findMany({ where: { status: "PAID" }, select: { finalAmount: true, createdAt: true } }),
      prisma.order.findMany({ where: { status: "PAID", createdAt: { gte: startOfToday } }, select: { finalAmount: true } }),
      prisma.order.findMany({ where: { status: "PAID", createdAt: { gte: startOfWeek } }, select: { finalAmount: true } }),
      prisma.order.findMany({ where: { status: "PAID", createdAt: { gte: startOfMonth } }, select: { finalAmount: true } }),
      prisma.order.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.note.count(),
      prisma.note.count({ where: { isFree: true } }),
      prisma.note.count({ where: { isFree: false } }),
      prisma.download.count(),
      prisma.download.count({ where: { isFreeDownload: true } }),
      prisma.order.findMany({
        take: 7,
        orderBy: { createdAt: "desc" },
        include: {
          items: { take: 2 },
          payment: true,
        },
      }),
      prisma.category.findMany({
        where: { parentId: null },
        include: {
          notes: {
            where: { status: "PUBLISHED" },
            select: { salesCount: true, price: true },
          },
        },
      }),
    ]);

    const totalRevenue = allPaidOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const weekRevenue = weekPaidOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const monthRevenue = monthPaidOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    // Category Sales breakdown
    const categorySales = categories.map((c) => {
      const sales = c.notes.reduce((sum, n) => sum + n.salesCount * n.price, 0);
      return {
        name: c.name,
        sales,
        count: c.notes.length,
      };
    });

    // Generate last 7 days chart points
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayRevenue = allPaidOrders
        .filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd)
        .reduce((sum, o) => sum + o.finalAmount, 0);

      const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      daysData.push({ day: dayName, revenue: dayRevenue });
    }

    return NextResponse.json({
      revenue: {
        allTime: totalRevenue,
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
      },
      orders: {
        totalPaid: allPaidOrders.length,
        pendingVerification: pendingOrdersCount,
      },
      students: {
        total: totalStudents,
      },
      notes: {
        total: totalNotes,
        free: freeNotesCount,
        paid: paidNotesCount,
      },
      downloads: {
        total: totalDownloads,
        free: freeDownloads,
        paid: Math.max(0, totalDownloads - freeDownloads),
      },
      recentOrders,
      categorySales,
      chartData: daysData,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to generate dashboard analytics" }, { status: 500 });
  }
}

