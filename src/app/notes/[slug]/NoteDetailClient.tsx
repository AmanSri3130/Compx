"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ShoppingCart,
  Zap,
  Eye,
  Star,
  FileText,
  CheckCircle,
  Share2,
  Calendar,
  Globe,
  HardDrive,
  User,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { formatPrice, calculateDiscount, formatDate } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PdfViewerModal } from "@/components/notes/PdfViewerModal";
import { NoteCard } from "@/components/notes/NoteCard";

export function NoteDetailClient({ note, relatedNotes }: { note: any; relatedNotes: any[] }) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();

  const [activeImage, setActiveImage] = useState(note.coverImage);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const discountPercent = calculateDiscount(note.mrp, note.price);
  const inCart = isInCart(note.id);

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/auth/login?returnTo=/notes/${note.slug}`);
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

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/auth/login?returnTo=/checkout`);
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  const handleFreeDownload = async () => {
    if (!user) {
      router.push(`/auth/login?returnTo=/notes/${note.slug}`);
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/notes/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: note.id,
          email: user?.email,
          name: user?.name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        alert(data.message || "Failed to download free note");
      }
    } catch {
      alert("Failed to initiate download");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-hidden">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-indigo-600">Browse</Link>
          <span>/</span>
          {note.category && (
            <>
              <Link href={`/browse?category=${note.category.slug}`} className="hover:text-indigo-600 truncate">
                {note.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 dark:text-slate-300 font-semibold truncate max-w-xs">{note.title}</span>
        </nav>

        {/* Note Hero Section: Left Gallery, Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Left Column: Image Gallery & Preview Trigger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-inner group">
              <img
                src={activeImage}
                alt={note.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Sample Preview Trigger Overlay Button */}
              <button
                onClick={() => setPreviewOpen(true)}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transition hover:scale-105"
              >
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Read Sample Pages (Preview)</span>
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {note.images && note.images.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveImage(note.coverImage)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === note.coverImage ? "border-indigo-600 shadow-md" : "border-slate-200 opacity-70"
                  }`}
                >
                  <img src={note.coverImage} alt="Main Cover" className="w-full h-full object-cover" />
                </button>
                {note.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImage === img.url ? "border-indigo-600 shadow-md" : "border-slate-200 opacity-70"
                    }`}
                  >
                    <img src={img.url} alt="Gallery page" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges under image */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified by Academic Educators & Board Toppers</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Unlocking to 'My Library' upon verification</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Clean High-Definition A4 PDF (Print Friendly)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Specs, Price, Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              {/* Category, Subject, Rating Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                  {note.category?.name || "Academic Notes"}
                </span>

                {note.subject && (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {note.subject}
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full ml-auto">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{note.avgRating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({note.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {note.title}
              </h1>

              {/* Author / Faculty */}
              {note.author && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>Curated by: <strong className="text-slate-800 dark:text-slate-200">{note.author}</strong></span>
                </div>
              )}

              {/* Short Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {note.shortDescription}
              </p>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Price (All Taxes Included)
                  </p>
                  {note.isFree ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        100% Free Resource
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        {formatPrice(note.price)}
                      </span>
                      {note.mrp > note.price && (
                        <span className="text-base text-slate-400 line-through">
                          {formatPrice(note.mrp)}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          Save {discountPercent}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-slate-400 hidden sm:block">
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Instant Access</p>
                  <p>Lifetime Library Validity</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {note.isFree ? (
                  <button
                    onClick={handleFreeDownload}
                    disabled={downloading}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                  >
                    <Download className="w-5 h-5" />
                    <span>{downloading ? "Preparing PDF..." : "Download Free Note (PDF)"}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Buy Now – Pay with UPI / QR / WhatsApp</span>
                    </button>

                    <button
                      onClick={handleAddToCart}
                      className={`px-6 py-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition ${
                        inCart
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-white"
                      }`}
                    >
                      {inCart ? <Check className="w-5 h-5 text-indigo-600" /> : <ShoppingCart className="w-5 h-5" />}
                      <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Social Share & Copy Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Share this study material:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this topper note on CompX: ${note.title} https://compx.in/notes/${note.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://compx.in/notes/${note.slug}`)}&text=${encodeURIComponent(note.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                  title="Share on Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: "More About This Note" Specs & Rich Content */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Full Description & Reviews */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* What's Included Card */}
            {note.whatsIncluded && note.whatsIncluded.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  <span>What's Included in this Study Material</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {note.whatsIncluded.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rich Content / Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                Detailed Description & Syllabus Coverage
              </h3>
              <div
                className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: note.fullDescription }}
              />

              {/* Tags */}
              {note.tagsList && note.tagsList.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2.5">Topics & Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {note.tagsList.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Reviews</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Verified purchasers who used this note for exams</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg">{note.avgRating}</span>
                </div>
              </div>

              {/* Reviews List */}
              {note.reviews && note.reviews.length > 0 ? (
                <div className="space-y-4">
                  {note.reviews.map((r: any) => (
                    <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {r.user?.name?.charAt(0) || "S"}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.user?.name || "Student"}</span>
                        </div>
                        <div className="flex items-center text-amber-400 text-xs">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      {r.title && <p className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</p>}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                      {r.adminReply && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-500 text-xs text-indigo-700 dark:text-indigo-300">
                          <strong>CompX Team:</strong> {r.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Column: "More About This Note" Specs Table */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                More About This Note
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Total Pages
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{note.pagesCount} Pages</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Language
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{note.language}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> File Size
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{note.fileSize || "18.5 MB"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Format
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{note.format || "PDF"}</span>
                </div>

                {note.syllabus && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                    <span className="text-slate-500">Syllabus</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">{note.syllabus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {note.difficulty || "Exam-Oriented"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/80">
                  <span className="text-slate-500">Edition / Year</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{note.editionYear || "2026 Edition"}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(note.updatedAt)}</span>
                </div>
              </div>

              {/* Sample Preview Button */}
              <button
                onClick={() => setPreviewOpen(true)}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Open Sample Preview (Watermarked)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Notes Carousel / Grid */}
        {relatedNotes && relatedNotes.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Similar Notes You May Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNotes.map((relNote) => (
                <NoteCard key={relNote.id} note={relNote} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* In-Browser PDF Preview Modal */}
      <PdfViewerModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={note.title}
        pdfUrl={note.previewPdfPath || "/storage/previews/class10-science-sample.pdf"}
        isSample={true}
      />
    </div>
  );
}

