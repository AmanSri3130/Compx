import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const subject = searchParams.get("subject");
    const classLevel = searchParams.get("classLevel");
    const type = searchParams.get("type"); // "free", "paid", "all"
    const language = searchParams.get("language");
    const sort = searchParams.get("sort") || "popular"; // "popular", "newest", "price_asc", "price_desc"
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED",
    };

    if (categorySlug && categorySlug !== "all") {
      where.OR = [
        { category: { slug: categorySlug } },
        { category: { parent: { slug: categorySlug } } },
      ];
    }

    if (subCategory && subCategory !== "all") {
      where.subCategory = subCategory;
    }

    if (subject && subject !== "all") {
      where.subject = subject;
    }

    if (classLevel && classLevel !== "all") {
      where.classLevel = classLevel;
    }

    if (type === "free") {
      where.isFree = true;
    } else if (type === "paid") {
      where.isFree = false;
    }

    if (language && language !== "all") {
      where.language = { contains: language };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search } },
            { subject: { contains: search } },
            { subCategory: { contains: search } },
            { tags: { contains: search } },
            { author: { contains: search } },
          ],
        },
      ];
    }

    // Determine sort order
    let orderBy: any = [{ salesCount: "desc" }, { viewsCount: "desc" }];
    if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "price_asc") {
      orderBy = [{ price: "asc" }];
    } else if (sort === "price_desc") {
      orderBy = [{ price: "desc" }];
    } else if (sort === "rating") {
      orderBy = [{ salesCount: "desc" }];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.note.count({ where }),
    ]);

    const formattedNotes = notes.map((n) => {
      const avgRating =
        n.reviews.length > 0
          ? Number((n.reviews.reduce((acc, r) => acc + r.rating, 0) / n.reviews.length).toFixed(1))
          : 5.0;

      return {
        ...n,
        avgRating,
        reviewsCount: n.reviews.length,
      };
    });

    return NextResponse.json({
      notes: formattedNotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Notes public GET error:", err);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

