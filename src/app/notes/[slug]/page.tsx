import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import { NoteDetailClient } from "./NoteDetailClient";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const note = await prisma.note.findUnique({
    where: { slug: params.slug },
    select: { title: true, shortDescription: true, coverImage: true, metaTitle: true, metaDescription: true },
  });

  if (!note) return { title: "Note Not Found – CompX" };

  return {
    title: `${note.metaTitle || note.title} | CompX`,
    description: note.metaDescription || note.shortDescription,
    openGraph: {
      title: note.title,
      description: note.shortDescription,
      images: [{ url: note.coverImage }],
    },
  };
}

export default async function NoteDetailPage({ params }: { params: { slug: string } }) {
  const note = await prisma.note.findUnique({
    where: { slug: params.slug },
    include: {
      category: {
        include: { parent: true },
      },
      images: {
        orderBy: { order: "asc" },
      },
      files: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!note) {
    notFound();
  }

  // Increment views count
  await prisma.note.update({
    where: { id: note.id },
    data: { viewsCount: { increment: 1 } },
  });

  // Fetch related notes from the same category
  const relatedNotes = await prisma.note.findMany({
    where: {
      categoryId: note.categoryId,
      id: { not: note.id },
      status: "PUBLISHED",
    },
    take: 3,
    orderBy: { salesCount: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
  });

  const formattedRelated = relatedNotes.map((n) => ({
    ...n,
    avgRating:
      n.reviews.length > 0
        ? Number((n.reviews.reduce((acc, r) => acc + r.rating, 0) / n.reviews.length).toFixed(1))
        : 5.0,
    reviewsCount: n.reviews.length,
  }));

  const avgRating =
    note.reviews.length > 0
      ? Number((note.reviews.reduce((acc, r) => acc + r.rating, 0) / note.reviews.length).toFixed(1))
      : 5.0;

  let whatsIncluded: string[] = [];
  try {
    whatsIncluded = JSON.parse(note.whatsIncluded);
  } catch {
    whatsIncluded = [
      "High-definition handwritten revision notes",
      "Chapter-wise formula sheets & shortcut techniques",
      "Standard university & board exam question models",
    ];
  }

  const tagsList = note.tags ? note.tags.split(",").map((t) => t.trim()) : [];

  return (
    <NoteDetailClient
      note={{
        ...note,
        avgRating,
        reviewsCount: note.reviews.length,
        whatsIncluded,
        tagsList,
      }}
      relatedNotes={formattedRelated}
    />
  );
}

