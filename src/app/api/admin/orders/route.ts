import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin, hasPermission } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const paymentMode = searchParams.get("paymentMode");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (paymentMode && paymentMode !== "ALL") {
      where.paymentMode = paymentMode;
    }
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { payment: { utr: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            note: {
              select: { id: true, title: true, slug: true, coverImage: true },
            },
          },
        },
        payment: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!hasPermission(session, "manage_orders")) {
      return NextResponse.json({ error: "You don't have permission to manage orders" }, { status: 403 });
    }

    const body = await req.json();
    const { action, orderId, reason, adminNotes } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            adminNotes: adminNotes || order.adminNotes,
          },
        }),
        prisma.payment.update({
          where: { orderId },
          data: {
            status: "PAID",
            verifiedAt: new Date(),
            verifiedBy: session.name,
          },
        }),
        // Increment salesCount on all ordered notes
        ...order.items.map((item) =>
          prisma.note.update({
            where: { id: item.noteId },
            data: { salesCount: { increment: 1 } },
          })
        ),
        // Student Notification
        prisma.notification.create({
          data: {
            userId: order.userId,
            title: `Order #${orderId} Approved!`,
            message: `Your payment of ₹${order.finalAmount} was verified. Your notes are unlocked in My Library!`,
            type: "PAYMENT",
            link: "/account/library",
          },
        }),
        // Audit log
        prisma.auditLog.create({
          data: {
            userId: session.id,
            userName: session.name,
            action: "APPROVE_PAYMENT",
            entityType: "ORDER",
            entityId: orderId,
            details: JSON.stringify({ amount: order.finalAmount, utr: order.payment?.utr }),
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Order #${orderId} approved successfully!` });
    }

    if (action === "REJECT") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "REJECTED",
            rejectionReason: reason || "Invalid UTR or screenshot. Please contact support.",
            adminNotes: adminNotes || order.adminNotes,
          },
        }),
        prisma.payment.update({
          where: { orderId },
          data: {
            status: "REJECTED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: order.userId,
            title: `Order #${orderId} Rejected`,
            message: `Payment verification failed: ${reason || "Invalid transaction details"}. Please re-submit or contact WhatsApp support.`,
            type: "PAYMENT",
            link: `/order-confirmation/${orderId}`,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.id,
            userName: session.name,
            action: "REJECT_PAYMENT",
            entityType: "ORDER",
            entityId: orderId,
            details: JSON.stringify({ reason }),
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Order #${orderId} rejected.` });
    }

    if (action === "REFUND") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "REFUNDED",
            adminNotes: adminNotes || "Payment refunded to student.",
          },
        }),
        prisma.payment.update({
          where: { orderId },
          data: {
            status: "REFUNDED",
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.id,
            userName: session.name,
            action: "REFUND_ORDER",
            entityType: "ORDER",
            entityId: orderId,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Order #${orderId} marked as refunded.` });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin order action error:", err);
    return NextResponse.json({ error: "Failed to process order action" }, { status: 500 });
  }
}

