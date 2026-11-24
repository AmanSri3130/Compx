"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ShoppingCart,
  Eye,
  Star,
  FileText,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PdfViewerModal } from "./PdfViewerModal";

export interface NoteCardProps {
  note: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    mrp: number;
    isFree: boolean;
    pagesCount: number;
    language: string;
    author?: string | null;
    subject?: string | null;
    category?: { name: string; slug: string } | null;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
    previewPdfPath?: string | null;
    avgRating?: number;
    reviewsCount?: number;
  };
}

export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const discountPercent = calculateDiscount(note.mrp, note.price);
  const inCart = isInCart(note.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/auth/login?returnTo=/browse`);
      return;
    }
    addItem({
      id: note.id,
      title: note.title,
      slug: note.slug,
      coverImage: note.coverImage,
      price: note.price,
      mrp: note.mrp,
      isFree: note.isFree,
      categoryName: note.category?.name,
      author: note.author || undefined,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/auth/login?returnTo=/checkout`);
      return;
    }
    addItem({
      id: note.id,
      title: note.title,
      slug: note.slug,
      coverImage: note.coverImage,
      price: note.price,
      mrp: note.mrp,
      isFree: note.isFree,
      categoryName: note.category?.name,
      author: note.author || undefined,
    });
    router.push("/checkout");
  };

  const handleFreeDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/auth/login?returnTo=/notes/${note.slug}`);
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/notes/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        router.push(`/notes/${note.slug}`);
      }
    } catch {
      router.push(`/notes/${note.slug}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
        
        {/* Cover Image & Badges */}
        <Link href={`/notes/${note.slug}`} className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 block">
          <img
            src={note.coverImage}
            alt={note.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Badges Left Top */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {note.isFree ? (
              <span className="bg-emerald-500 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>100% FREE</span>
              </span>
            ) : discountPercent > 0 ? (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            ) : null}

            {note.isBestSeller && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                Bestseller
              </span>
            )}
          </div>

          {/* Quick Sample Preview Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-900 dark:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Sample Preview"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preview</span>
          </button>
        </Link>

        {/* Content Box */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          
          <div>
            {/* Category / Subject Pill & Rating */}
            <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                {note.subject || note.category?.name || "Study Material"}
              </span>

              <div className="flex items-center gap-1 text-amber-500 shrink-0 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{note.avgRating || 4.9}</span>
                {note.reviewsCount ? (
                  <span className="text-[10px] text-slate-400 font-normal">({note.reviewsCount})</span>
                ) : null}
              </div>
            </div>

            {/* Title */}
            <Link href={`/notes/${note.slug}`} className="block">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {note.title}
              </h3>
            </Link>

            {/* Author */}
            {note.author && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                By {note.author}
              </p>
            )}

            {/* Specs bar (Pages, Format, Language) */}
            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>{note.pagesCount} Pages</span>
              </span>
              <span>•</span>
              <span>PDF</span>
              <span>•</span>
              <span className="truncate">{note.language}</span>
            </div>
          </div>

          {/* Pricing & CTA Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            
            {/* Price display in ₹ */}
            <div>
              {note.isFree ? (
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {formatPrice(note.price)}
                  </span>
                  {note.mrp > note.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(note.mrp)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              {note.isFree ? (
                <button
                  onClick={handleFreeDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  title="Download Free PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading ? "Downloading..." : "Download"}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`p-2 rounded-xl border text-xs font-semibold transition ${
                      inCart
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300"
                        : "border-slate-200 hover:border-indigo-400 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    }`}
                    title={inCart ? "In Cart" : "Add to Cart"}
                  >
                    {inCart ? <Check className="w-4 h-4 text-indigo-600" /> : <ShoppingCart className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-500/20 hover:scale-[1.02] transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sample Preview Modal */}
      <PdfViewerModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={note.title}
        pdfUrl={note.previewPdfPath || "/storage/previews/class10-science-sample.pdf"}
        isSample={true}
      />
    </>
  );
}

