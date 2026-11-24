import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!hasPermission(session, "manage_cms")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: body,
      create: {
        id: "default",
        ...body,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "UPDATE_SETTINGS",
        entityType: "SETTING",
        entityId: "default",
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error("Settings update error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

