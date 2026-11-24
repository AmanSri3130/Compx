"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeItem, clearCart, subtotal, totalMrp, totalSavings } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplying(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
        setCouponDiscount(0);
        setAppliedCoupon(null);
      } else {
        setCouponDiscount(data.coupon.discountAmount);
        setAppliedCoupon(data.coupon.code);
        setCouponError("");
      }
    } catch {
      setCouponError("Failed to apply coupon");
    } finally {
      setApplying(false);
    }
  };

  const finalAmount = Math.max(0, subtotal - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950/40">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-5">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto text-3xl">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Explore our curated collection of topper notes, formula cheat sheets, and board revision guides.
          </p>
          <div className="pt-2">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition"
            >
              <span>Browse Topper Notes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Shopping Cart ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Review your selected exam revision notes</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                  />
                  <div>
                    {item.categoryName && (
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {item.categoryName}
                      </span>
                    )}
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 mt-1">
                      {item.title}
                    </h3>
                    {item.author && (
                      <p className="text-xs text-slate-500">By {item.author}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    {item.isFree ? (
                      <span className="text-base font-black text-emerald-600">FREE</span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {formatPrice(item.price)}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(item.mrp)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Coupon Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Apply Discount Coupon</span>
              </h3>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COMPX50"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={applying || !couponCode.trim()}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {applying ? "..." : "Apply"}
                </button>
              </form>

              {appliedCoupon && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Coupon '{appliedCoupon}' applied! Saved ₹{couponDiscount}
                </p>
              )}

              {couponError && (
                <p className="text-xs text-rose-600 font-medium">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Total MRP</span>
                  <span>{formatPrice(totalMrp)}</span>
                </div>

                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>MRP Discount</span>
                  <span>- {formatPrice(totalSavings)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Coupon Savings</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
                  <span>Total Payable</span>
                  <span className="text-xl text-indigo-600 dark:text-indigo-400">
                    {formatPrice(finalAmount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  const queryParam = appliedCoupon ? `?coupon=${appliedCoupon}` : "";
                  if (!user) {
                    router.push(`/auth/login?returnTo=/checkout${queryParam}`);
                    return;
                  }
                  router.push(`/checkout${queryParam}`);
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <span>{user ? "Proceed to Checkout" : "Sign In & Proceed to Checkout"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Verified Study Material • Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

