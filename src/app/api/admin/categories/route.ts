import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin, hasPermission } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: {
        children: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { notes: true } },
          },
        },
        _count: { select: { notes: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error("Admin categories GET error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, icon, parentId, order = 0, showOnHome = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let slug = slugify(name);
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description,
        icon: icon || "BookOpen",
        parentId: parentId || null,
        order: parseInt(order, 10) || 0,
        showOnHome: Boolean(showOnHome),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error("Category create error:", err);
    return NextResponse.json({ error: "Failed to create category: " + err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, description, icon, parentId, order, showOnHome } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        parentId: parentId || null,
        order: order !== undefined ? parseInt(order, 10) : undefined,
        showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : undefined,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    console.error("Category update error:", err);
    return NextResponse.json({ error: "Failed to update category: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (err: any) {
    console.error("Category delete error:", err);
    return NextResponse.json({ error: "Failed to delete category: " + err.message }, { status: 500 });
  }
}

