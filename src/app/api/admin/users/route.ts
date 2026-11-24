import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin, isSuperAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: any = {};
    if (role && role !== "ALL") where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: { orders: true, downloads: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: "Only Super Admins can modify user roles and permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { id, role, permissions, isBlocked } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (role) data.role = role;
    if (permissions) {
      data.permissions = Array.isArray(permissions) ? JSON.stringify(permissions) : permissions;
    }
    if (isBlocked !== undefined) data.isBlocked = Boolean(isBlocked);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isBlocked: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "UPDATE_USER_PERMISSIONS",
        entityType: "USER",
        entityId: id,
        details: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: "Failed to update user: " + err.message }, { status: 500 });
  }
}

