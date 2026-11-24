import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to view your orders" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            note: {
              select: { id: true, title: true, slug: true, coverImage: true, price: true },
            },
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Account orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

