import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [reviews, messages] = await Promise.all([
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          note: { select: { id: true, title: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ reviews, messages });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch reviews and messages" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isApproved, adminReply, messageId, messageStatus } = body;

    if (id) {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined,
          adminReply: adminReply !== undefined ? adminReply : undefined,
        },
      });
      return NextResponse.json({ success: true, review: updated });
    }

    if (messageId) {
      const updatedMsg = await prisma.contactMessage.update({
        where: { id: messageId },
        data: { status: messageStatus },
      });
      return NextResponse.json({ success: true, message: updatedMsg });
    }

    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Update failed: " + err.message }, { status: 500 });
  }
}

