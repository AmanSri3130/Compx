"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Saved Notes & Wishlist
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            ❤️
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Save interesting topper notes, question banks, and formula books to revisit them later.
          </p>
          <div className="pt-2">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Explore All Notes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

