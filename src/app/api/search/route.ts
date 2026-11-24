import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category");
    const isFree = searchParams.get("isFree");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!q && !categorySlug) {
      // Return top trending notes
      const trending = await prisma.note.findMany({
        where: { status: "PUBLISHED" },
        take: 6,
        orderBy: [{ salesCount: "desc" }, { viewsCount: "desc" }],
        include: { category: true },
      });
      return NextResponse.json({ notes: trending, categories: [] });
    }

    const where: any = {
      status: "PUBLISHED",
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isFree === "true") {
      where.isFree = true;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { subject: { contains: q } },
        { subCategory: { contains: q } },
        { tags: { contains: q } },
        { author: { contains: q } },
        { shortDescription: { contains: q } },
      ];
    }

    const [notes, matchingCategories] = await Promise.all([
      prisma.note.findMany({
        where,
        take: limit,
        orderBy: [{ isBestSeller: "desc" }, { viewsCount: "desc" }],
        include: { category: true },
      }),
      q
        ? prisma.category.findMany({
            where: {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
              ],
            },
            take: 4,
          })
        : [],
    ]);

    return NextResponse.json({
      notes,
      categories: matchingCategories,
      query: q,
      total: notes.length,
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}

