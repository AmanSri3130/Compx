"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ExternalLink,
  CreditCard,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromUrl = searchParams.get("coupon") || "";

  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  // Student contact info
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  // Payment mode: "UPI_QR" or "WHATSAPP" or "GATEWAY_RAZORPAY"
  const [paymentMode, setPaymentMode] = useState<"UPI_QR" | "WHATSAPP" | "GATEWAY_RAZORPAY">("UPI_QR");

  // Step state: 1 = Details & Mode, 2 = QR & UTR / WhatsApp Submission
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generated Order Details
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // UTR & Screenshot for Mode A
  const [utr, setUtr] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?returnTo=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  if (items.length === 0 && !orderData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">No items in checkout</h2>
          <Link href="/browse" className="text-indigo-600 font-bold underline">
            Browse Notes →
          </Link>
        </div>
      </div>
    );
  }

  // Step 1: Create Order
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteIds: items.map((i) => i.id),
          paymentMode,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          couponCode: couponFromUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create order");
      } else {
        setOrderData(data.order);
        setPaymentDetails(data.paymentDetails);
        setStep(2);
        clearCart(); // Clear local cart once order is registered

        // If Mode B (WhatsApp), redirect or open immediately
        if (paymentMode === "WHATSAPP" && data.paymentDetails?.whatsAppUrl) {
          window.open(data.paymentDetails.whatsAppUrl, "_blank");
        }
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Upload Payment Screenshot
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "screenshot");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setScreenshotUrl(data.url);
      } else {
        alert(data.error || "Failed to upload screenshot");
      }
    } catch {
      alert("Screenshot upload failed");
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Submit UTR & Screenshot for Verification
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) {
      alert("Please enter the 12-digit UPI UTR / Transaction ID");
      return;
    }

    setSubmittingVerification(true);
    try {
      const res = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          utr: utr.trim(),
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit verification details");
      } else {
        router.push(`/order-confirmation/${orderData.id}`);
      }
    } catch {
      alert("Verification submission error");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleCopyUpi = () => {
    if (paymentDetails?.upiId) {
      navigator.clipboard.writeText(paymentDetails.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Complete Your Notes Order
          </h1>
        </div>

        {/* STEP 1: Student Details & Mode Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Contact Info & Payment Mode */}
            <form onSubmit={handleProceedToPayment} className="md:col-span-7 space-y-6">
              
              {/* Contact Details Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  1. Student Delivery Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Notes delivered to this ID) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@gmail.com"
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Mobile Number (For instant delivery update)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  2. Choose Payment Mode
                </h3>

                <div className="space-y-3">
                  {/* Mode A: UPI QR Code */}
                  <label
                    onClick={() => setPaymentMode("UPI_QR")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentMode === "UPI_QR"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Pay via UPI QR Code / Any UPI App
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Fastest & Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Scan pre-filled dynamic QR code with Google Pay, PhonePe, Paytm, or BHIM. Enter UTR to verify.
                      </p>
                    </div>
                  </label>

                  {/* Mode B: Direct WhatsApp */}
                  <label
                    onClick={() => setPaymentMode("WHATSAPP")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentMode === "WHATSAPP"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Direct WhatsApp Payment & Confirmation
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Chat directly with our team on WhatsApp to complete payment and receive your notes immediately.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <span>{loading ? "Generating Secure Payment..." : "Generate Dynamic UPI QR & Proceed →"}</span>
              </button>
            </form>

            {/* Right: Order Summary */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Order Items ({items.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img src={item.coverImage} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.title}</p>
                      <p className="text-slate-400">{item.isFree ? "FREE" : formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Amount to Pay</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Live Dynamic UPI QR & UTR Verification Form */}
        {step === 2 && orderData && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Header info */}
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
                Order ID: {orderData.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                Scan & Pay {formatPrice(orderData.finalAmount)}
              </h2>
              <p className="text-xs text-slate-500">
                Exact amount is pre-encoded in this dynamic QR code
              </p>
            </div>

            {/* Dynamic QR Display */}
            {paymentDetails?.dynamicQrDataUrl ? (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700/80 space-y-4">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
                  <img
                    src={paymentDetails.dynamicQrDataUrl}
                    alt="Dynamic UPI QR"
                    className="w-56 h-56 object-contain"
                  />
                </div>

                {/* Mobile Intent Deep Link: opens GPay/PhonePe/Paytm directly */}
                {paymentDetails.upiIntentUri && (
                  <a
                    href={paymentDetails.upiIntentUri}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Pay via Any UPI App (GPay / PhonePe / Paytm)</span>
                  </a>
                )}

                {/* Copy UPI ID */}
                <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">UPI ID:</span>
                  <strong className="text-slate-800 dark:text-slate-100">{paymentDetails.upiId}</strong>
                  <button onClick={handleCopyUpi} className="text-indigo-600 hover:underline flex items-center gap-1 ml-1 font-semibold">
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* WhatsApp Fallback Button */}
            {paymentDetails?.whatsAppUrl && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Prefer chatting or confirming on WhatsApp?
                </p>
                <a
                  href={paymentDetails.whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Payment Chat</span>
                </a>
              </div>
            )}

            {/* Verification Form: UTR & Screenshot */}
            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Step 2: Enter Transaction Details for Instant Approval
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  UPI 12-Digit UTR / Transaction Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                  placeholder="e.g. 432109876543 (Find in your GPay/PhonePe receipt)"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-bold tracking-wider rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Payment Screenshot (Optional but speeds up verification)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl p-3 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        disabled={uploadingScreenshot}
                      />
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span>{uploadingScreenshot ? "Uploading..." : screenshotUrl ? "Screenshot Uploaded (Click to replace)" : "Click to select payment screenshot"}</span>
                      </div>
                    </label>
                    {screenshotUrl && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Attached
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  {screenshotUrl && (
                    <div className="relative inline-block border-2 border-emerald-500 rounded-xl overflow-hidden p-1 bg-white dark:bg-slate-800 shadow-sm">
                      <img
                        src={screenshotUrl}
                        alt="Payment Screenshot Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <span className="block text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        Proof Ready
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingVerification || !utr.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] disabled:opacity-50"
              >
                <span>{submittingVerification ? "Verifying..." : "Submit Payment for Verification →"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

