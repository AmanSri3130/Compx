import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMasterAdminSession, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [banners, pages, settings] = await Promise.all([
      prisma.banner.findMany({ orderBy: { order: "asc" } }),
      prisma.page.findMany({ orderBy: { slug: "asc" } }),
      prisma.siteSetting.findUnique({ where: { id: "default" } }),
    ]);

    return NextResponse.json({ banners, pages, settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch CMS data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { type, banner, page } = body;

    if (type === "banner") {
      const newBanner = await prisma.banner.create({
        data: banner,
      });
      return NextResponse.json({ success: true, banner: newBanner });
    }

    if (type === "page") {
      const updatedPage = await prisma.page.upsert({
        where: { slug: page.slug },
        update: page,
        create: page,
      });
      return NextResponse.json({ success: true, page: updatedPage });
    }

    return NextResponse.json({ error: "Invalid CMS type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "CMS update error: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getMasterAdminSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const bannerId = searchParams.get("bannerId");

    if (bannerId) {
      await prisma.banner.delete({ where: { id: bannerId } });
      return NextResponse.json({ success: true, message: "Banner deleted" });
    }

    return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Delete error: " + err.message }, { status: 500 });
  }
}

