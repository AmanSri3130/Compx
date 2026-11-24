import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin, hasPermission } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (categoryId && categoryId !== "ALL") where.categoryId = categoryId;
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { subject: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { orderItems: true, downloads: true, reviews: true },
        },
      },
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error("Admin notes GET error:", err);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!hasPermission(session, "manage_notes")) {
      return NextResponse.json({ error: "You don't have permission to create notes" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      shortDescription,
      fullDescription,
      coverImage,
      price = 0,
      mrp = 0,
      isFree = false,
      hasGst = false,
      gstPercent = 0,
      categoryId,
      subCategory,
      subject,
      classLevel,
      semester,
      pagesCount = 0,
      language = "English",
      author,
      fileSize,
      format = "PDF",
      syllabus,
      whatsIncluded = [],
      tags = "",
      difficulty = "Medium",
      editionYear,
      status = "PUBLISHED",
      isFeatured = false,
      isTrending = false,
      isBestSeller = false,
      pdfPath,
      previewPdfPath,
      enableWatermark = true,
      metaTitle,
      metaDescription,
    } = body;

    if (!title || !shortDescription || !categoryId || !pdfPath) {
      return NextResponse.json({ error: "Title, description, category, and PDF file are required" }, { status: 400 });
    }

    let slug = slugify(title);
    const existingSlug = await prisma.note.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        slug,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription || shortDescription,
        coverImage: coverImage || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
        price: isFree ? 0 : parseFloat(price),
        mrp: parseFloat(mrp) || parseFloat(price),
        isFree: Boolean(isFree),
        hasGst: Boolean(hasGst),
        gstPercent: parseFloat(gstPercent) || 0,
        categoryId,
        subCategory,
        subject,
        classLevel,
        semester,
        pagesCount: parseInt(pagesCount, 10) || 0,
        language,
        author,
        fileSize,
        format,
        syllabus,
        whatsIncluded: typeof whatsIncluded === "string" ? whatsIncluded : JSON.stringify(whatsIncluded),
        tags: Array.isArray(tags) ? tags.join(", ") : tags,
        difficulty,
        editionYear,
        status,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isBestSeller: Boolean(isBestSeller),
        pdfPath,
        previewPdfPath,
        enableWatermark: Boolean(enableWatermark),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || shortDescription,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "CREATE_NOTE",
        entityType: "NOTE",
        entityId: note.id,
        details: JSON.stringify({ title: note.title, isFree: note.isFree, price: note.price }),
      },
    });

    // Revalidate public catalog pages so users see the new note instantly
    try {
      revalidatePath("/");
      revalidatePath("/browse");
      revalidatePath(`/notes/${note.slug}`);
    } catch {}

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    console.error("Admin note create error:", err);
    return NextResponse.json({ error: "Failed to create note: " + err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!hasPermission(session, "manage_notes")) {
      return NextResponse.json({ error: "You don't have permission to update notes" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    if (data.whatsIncluded && typeof data.whatsIncluded !== "string") {
      data.whatsIncluded = JSON.stringify(data.whatsIncluded);
    }

    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.mrp !== undefined) data.mrp = parseFloat(data.mrp);
    if (data.pagesCount !== undefined) data.pagesCount = parseInt(data.pagesCount, 10);

    const updated = await prisma.note.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "UPDATE_NOTE",
        entityType: "NOTE",
        entityId: id,
        details: JSON.stringify({ title: updated.title }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/browse");
      revalidatePath(`/notes/${updated.slug}`);
    } catch {}

    return NextResponse.json({ success: true, note: updated });
  } catch (err: any) {
    console.error("Admin note update error:", err);
    return NextResponse.json({ error: "Failed to update note: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!hasPermission(session, "manage_notes")) {
      return NextResponse.json({ error: "You don't have permission to delete notes" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const deleted = await prisma.note.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "DELETE_NOTE",
        entityType: "NOTE",
        entityId: id,
        details: JSON.stringify({ title: deleted.title }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/browse");
    } catch {}

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (err: any) {
    console.error("Admin note delete error:", err);
    return NextResponse.json({ error: "Failed to delete note: " + err.message }, { status: 500 });
  }
}

