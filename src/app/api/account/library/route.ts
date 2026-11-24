import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to access your library" }, { status: 401 });
    }

    // 1. Get all notes from PAID orders for this user
    const paidOrders = await prisma.order.findMany({
      where: {
        userId: session.id,
        status: "PAID",
      },
      include: {
        items: {
          include: {
            note: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const noteMap = new Map();

    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.note && !noteMap.has(item.note.id)) {
          noteMap.set(item.note.id, {
            ...item.note,
            unlockedAt: order.createdAt,
            orderId: order.id,
            isPurchased: true,
          });
        }
      });
    });

    // 2. Also get free downloaded notes for this user
    const freeDownloads = await prisma.download.findMany({
      where: {
        userId: session.id,
        isFreeDownload: true,
      },
      include: {
        note: {
          include: { category: true },
        },
      },
      orderBy: { downloadedAt: "desc" },
    });

    freeDownloads.forEach((dl) => {
      if (dl.note && !noteMap.has(dl.note.id)) {
        noteMap.set(dl.note.id, {
          ...dl.note,
          unlockedAt: dl.downloadedAt,
          isPurchased: false,
        });
      }
    });

    const libraryNotes = Array.from(noteMap.values());

    return NextResponse.json({
      notes: libraryNotes,
      totalNotes: libraryNotes.length,
    });
  } catch (err: any) {
    console.error("Library GET error:", err);
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }
}

