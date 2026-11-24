"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Check,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Save,
} from "lucide-react";
import Link from "next/link";

export function NoteForm({ initialData }: { initialData?: any }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [pdfPath, setPdfPath] = useState(initialData?.pdfPath || "");
  const [previewPdfPath, setPreviewPdfPath] = useState(initialData?.previewPdfPath || "");

  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [classLevel, setClassLevel] = useState(initialData?.classLevel || "");
  const [semester, setSemester] = useState(initialData?.semester || "");

  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [price, setPrice] = useState(initialData?.price || 0);
  const [mrp, setMrp] = useState(initialData?.mrp || 0);

  const [pagesCount, setPagesCount] = useState(initialData?.pagesCount || 100);
  const [language, setLanguage] = useState(initialData?.language || "English");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [fileSize, setFileSize] = useState(initialData?.fileSize || "15.0 MB");
  const [syllabus, setSyllabus] = useState(initialData?.syllabus || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Exam-Oriented");
  const [editionYear, setEditionYear] = useState(initialData?.editionYear || "2026 Edition");
  const [tags, setTags] = useState(initialData?.tags || "");

  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false);
  const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller || false);
  const [enableWatermark, setEnableWatermark] = useState(initialData?.enableWatermark ?? true);

  // Bullet points
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(
    initialData?.whatsIncluded
      ? typeof initialData.whatsIncluded === "string"
        ? JSON.parse(initialData.whatsIncluded)
        : initialData.whatsIncluded
      : [
          "Complete handwritten chapter notes",
          "Formula cheat sheet & memory mnemonics",
          "Model questions & answers",
        ]
  );
  const [newBullet, setNewBullet] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const json = await res.json();
          // Flatten parent and children
          const flat: any[] = [];
          (json.categories || []).forEach((c: any) => {
            flat.push(c);
            if (c.children) {
              c.children.forEach((sub: any) => flat.push({ ...sub, name: `↳ ${sub.name}` }));
            }
          });
          setCategories(flat);
          if (!categoryId && flat.length > 0) {
            setCategoryId(flat[0].id);
          }
        }
      } catch {}
    }
    loadCategories();
  }, []);

  const handleAddBullet = () => {
    if (newBullet.trim()) {
      setWhatsIncluded([...whatsIncluded, newBullet.trim()]);
      setNewBullet("");
    }
  };

  const handleRemoveBullet = (index: number) => {
    setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "pdf",
    setter: (url: string) => void,
    loadingSetter: (v: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadingSetter(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setter(data.url);
        if (type === "pdf" && data.fileSize) {
          setFileSize(data.fileSize);
        }
      } else {
        alert(data.error || "File upload failed");
      }
    } catch {
      alert("Upload failed due to network error");
    } finally {
      loadingSetter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription || !categoryId) {
      alert("Please fill in Title, Description, and Category");
      return;
    }

    setSubmitting(true);
    const payload = {
      id: initialData?.id,
      title,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      coverImage: coverImage || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
      pdfPath: pdfPath || "/storage/sample-pdfs/class10-science-topper-notes.pdf",
      previewPdfPath: previewPdfPath || "/storage/previews/class10-science-sample.pdf",
      categoryId,
      subCategory,
      subject,
      classLevel,
      semester,
      isFree,
      price: isFree ? 0 : price,
      mrp: isFree ? 0 : mrp,
      pagesCount,
      language,
      author,
      fileSize,
      syllabus,
      difficulty,
      editionYear,
      tags,
      whatsIncluded,
      status,
      isFeatured,
      isTrending,
      isBestSeller,
      enableWatermark,
    };

    try {
      const method = initialData?.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/notes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save note");
      } else {
        router.push("/admin/notes");
      }
    } catch {
      alert("Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notes"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Saving..." : initialData ? "Update Note" : "Publish Note"}</span>
        </button>
      </div>

      {/* Basic Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          1. General Information
        </h3>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Note Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Class 10 Science: Complete Handwritten Topper Notes"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Short Description *</label>
          <textarea
            required
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 2-line summary visible on cards..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Full Rich Description</label>
          <textarea
            rows={5}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed chapter breakdown, syllabus details, exam advice (HTML supported)..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Category & Academic Classification */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          2. Category & Academic Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Target Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Subcategory / Exam</label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. CBSE Class 10 / JEE Main"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics / Mathematics"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Author / Faculty</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Kota Faculty / 98% Board Topper"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Free Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          3. Pricing & Resource Type
        </h3>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Mark as 100% FREE Resource</span>
          </label>
        </div>

        {!isFree && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="149"
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">MRP for Strike-through Discount (₹)</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                placeholder="399"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* File Uploads (Cover Image & PDF) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          4. Files & Anti-Piracy Protection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Cover Image</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "image", setCoverImage, setUploadingCover)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              {uploadingCover && <p className="text-indigo-400">Uploading cover image...</p>}
              {coverImage && (
                <div className="w-24 h-28 rounded-xl overflow-hidden border border-slate-700">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Private PDF Upload */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Private Protected PDF File *</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileUpload(e, "pdf", setPdfPath, setUploadingPdf)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              {uploadingPdf && <p className="text-indigo-400">Uploading private PDF document...</p>}
              {pdfPath && (
                <p className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> PDF Attached ({fileSize})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Anti-Piracy Watermarking Option */}
        <div className="pt-3 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
            <input
              type="checkbox"
              checked={enableWatermark}
              onChange={(e) => setEnableWatermark(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Enable Anti-Piracy Digital Watermark (Embeds Buyer Email & Order Reference)</span>
          </label>
        </div>
      </div>

      {/* "What's Included" Bullet points */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          5. Highlights / What's Included (Bullet Points)
        </h3>

        <div className="space-y-2">
          {whatsIncluded.map((bullet, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <input
                type="text"
                value={bullet}
                onChange={(e) => {
                  const updated = [...whatsIncluded];
                  updated[idx] = e.target.value;
                  setWhatsIncluded(updated);
                }}
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => handleRemoveBullet(idx)}
                className="text-slate-400 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newBullet}
            onChange={(e) => setNewBullet(e.target.value)}
            placeholder="Add new highlight point..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleAddBullet}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Flags & Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
          6. Status & Storefront Badges
        </h3>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Featured Note</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={(e) => setIsTrending(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Trending Badge</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Bestseller Ribbon</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01]"
        >
          {submitting ? "Saving Note..." : initialData ? "Save Changes" : "Create & Publish Note"}
        </button>
      </div>
    </form>
  );
}

