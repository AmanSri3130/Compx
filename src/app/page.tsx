import React from "react";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryCards } from "@/components/home/CategoryCards";
import { FreeNotesSection } from "@/components/home/FreeNotesSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { CommunityJoinSection } from "@/components/home/CommunityJoinSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [categories, freeNotes, trendingNotes] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null, showOnHome: true },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { notes: true } },
        },
      }),
      prisma.note.findMany({
        where: { isFree: true, status: "PUBLISHED" },
        take: 6,
        orderBy: [{ downloadsCount: "desc" }],
        include: {
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.note.findMany({
        where: { status: "PUBLISHED" },
        take: 12,
        orderBy: [{ isBestSeller: "desc" }, { salesCount: "desc" }, { viewsCount: "desc" }],
        include: {
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
    ]);

    const formatNotes = (list: any[]) =>
      list.map((n) => ({
        ...n,
        avgRating:
          n.reviews.length > 0
            ? Number((n.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / n.reviews.length).toFixed(1))
            : 5.0,
        reviewsCount: n.reviews.length,
      }));

    return {
      categories,
      freeNotes: formatNotes(freeNotes),
      trendingNotes: formatNotes(trendingNotes),
    };
  } catch (err) {
    console.error("Home page data fetch error:", err);
    return {
      categories: [],
      freeNotes: [],
      trendingNotes: [],
    };
  }
}

export default async function HomePage() {
  const { categories, freeNotes, trendingNotes } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero with Search & Value Props */}
      <HeroSection />

      {/* 2. Structured Category Cards */}
      <CategoryCards categories={categories} />

      {/* 3. 100% Free Notes Section */}
      <FreeNotesSection freeNotes={freeNotes} />

      {/* 4. Trending & Bestsellers with Category Filters */}
      <TrendingSection notes={trendingNotes} />

      {/* 5. WhatsApp & Telegram Community Join */}
      <CommunityJoinSection />

      {/* 6. Student Testimonials */}
      <TestimonialsSection />

      {/* 7. Frequently Asked Questions */}
      <FaqSection />
    </div>
  );
}

