"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [parentId, setParentId] = useState("");
  const [order, setOrder] = useState(0);
  const [showOnHome, setShowOnHome] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
      }
    } catch (e) {
      console.error("Categories fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = (parentCatId = "") => {
    setEditingId(null);
    setName("");
    setDescription("");
    setIcon("BookOpen");
    setParentId(parentCatId);
    setOrder(0);
    setShowOnHome(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "BookOpen");
    setParentId(cat.parentId || "");
    setOrder(cat.order || 0);
    setShowOnHome(cat.showOnHome ?? true);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId,
        name: name.trim(),
        description: description.trim(),
        icon,
        parentId: parentId || null,
        order,
        showOnHome,
      };

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch {
      alert("Category save error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}" and its subcategories?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      } else {
        alert("Failed to delete category");
      }
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Categories & Hierarchy</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage unlimited nested streams: Category → Subcategory → Subject → Semester
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Root Category</span>
        </button>
      </div>

      {/* Categories Tree */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-3xl">
            No categories defined yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Parent Category Row */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {cat.icon || "📁"}
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{cat.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">/{cat.slug}</span>
                      {cat.showOnHome && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded">
                          Home
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-400 mr-2">
                    {cat._count?.notes || 0} notes
                  </span>
                  <button
                    onClick={() => handleOpenCreate(cat.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
                    title="Add Subcategory"
                  >
                    + Subcategory
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories Children List */}
              {cat.children && cat.children.length > 0 && (
                <div className="divide-y divide-slate-800/50 pl-10 pr-4 py-1 bg-slate-950/40">
                  {cat.children.map((child: any) => (
                    <div
                      key={child.id}
                      className="py-2.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/20 px-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-600">↳</span>
                        <span className="font-medium text-slate-200 truncate">{child.name}</span>
                        <span className="text-[10px] text-slate-500">/{child.slug}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-500">
                          {child._count?.notes || 0} notes
                        </span>
                        <button
                          onClick={() => handleOpenEdit(child)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Edit Subcategory"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(child.id, child.name)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete Subcategory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Create/Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              {editingId ? "Edit Category" : parentId ? "Add Subcategory" : "Create New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Class 10 Board / JEE Main"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short overview of what's inside this stream..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="BookOpen or ⚡ or 🏛️"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Show in Top Categories on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

