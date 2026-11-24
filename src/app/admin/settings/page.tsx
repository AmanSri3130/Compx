"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  QrCode,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Lock,
  Upload,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState("CompX");
  const [tagline, setTagline] = useState("Study smart. Score higher.");
  const [upiId, setUpiId] = useState("compx@upi");
  const [upiPayeeName, setUpiPayeeName] = useState("CompX Education");
  const [upiQrImageUrl, setUpiQrImageUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");
  const [whatsappWelcomeMsg, setWhatsappWelcomeMsg] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

  const [freeNotesRequireLogin, setFreeNotesRequireLogin] = useState(false);
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [signedUrlExpiryMinutes, setSignedUrlExpiryMinutes] = useState(60);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [contactEmail, setContactEmail] = useState("support@compx.in");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [telegramGroupUrl, setTelegramGroupUrl] = useState("");
  const [whatsappCommunityUrl, setWhatsappCommunityUrl] = useState("");

  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          const s = json.settings || {};
          if (s.siteName) setSiteName(s.siteName);
          if (s.tagline) setTagline(s.tagline);
          if (s.upiId) setUpiId(s.upiId);
          if (s.upiPayeeName) setUpiPayeeName(s.upiPayeeName);
          if (s.upiQrImageUrl) setUpiQrImageUrl(s.upiQrImageUrl);
          if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
          if (s.whatsappWelcomeMsg) setWhatsappWelcomeMsg(s.whatsappWelcomeMsg);
          setRazorpayEnabled(Boolean(s.razorpayEnabled));
          if (s.razorpayKeyId) setRazorpayKeyId(s.razorpayKeyId);
          if (s.razorpayKeySecret) setRazorpayKeySecret(s.razorpayKeySecret);

          setFreeNotesRequireLogin(Boolean(s.freeNotesRequireLogin));
          setEnableWatermark(s.enableWatermark ?? true);
          if (s.signedUrlExpiryMinutes) setSignedUrlExpiryMinutes(s.signedUrlExpiryMinutes);
          setMaintenanceMode(Boolean(s.maintenanceMode));

          if (s.contactEmail) setContactEmail(s.contactEmail);
          if (s.contactPhone) setContactPhone(s.contactPhone);
          if (s.telegramGroupUrl) setTelegramGroupUrl(s.telegramGroupUrl);
          if (s.whatsappCommunityUrl) setWhatsappCommunityUrl(s.whatsappCommunityUrl);
        }
      } catch (e) {
        console.error("Settings load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUpiQrImageUrl(data.url);
      }
    } catch {
      alert("Failed to upload QR image");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        siteName,
        tagline,
        upiId,
        upiPayeeName,
        upiQrImageUrl,
        whatsappNumber,
        whatsappWelcomeMsg,
        razorpayEnabled,
        razorpayKeyId,
        razorpayKeySecret,
        freeNotesRequireLogin,
        enableWatermark,
        signedUrlExpiryMinutes: parseInt(signedUrlExpiryMinutes as any, 10) || 60,
        maintenanceMode,
        contactEmail,
        contactPhone,
        telegramGroupUrl,
        whatsappCommunityUrl,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white">Payment & Marketplace Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure UPI QR code, payee VPA, WhatsApp support number, and anti-piracy controls
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Section 1: UPI QR Configuration (Mode A) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">
              UPI QR Code & Payee Details (Mode A)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">UPI ID / VPA *</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. compx@upi or yourname@oksbi"
                className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Payee Business Name *</label>
              <input
                type="text"
                required
                value={upiPayeeName}
                onChange={(e) => setUpiPayeeName(e.target.value)}
                placeholder="CompX Education"
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Static UPI QR Code Image (Fallback)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white cursor-pointer"
              />
              {uploadingQr && <span className="text-indigo-400">Uploading QR...</span>}
              {upiQrImageUrl && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> QR image set
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Settings (Mode B) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              WhatsApp Integration & Direct Chat (Mode B)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                WhatsApp Helpline Number (with country code) *
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                WhatsApp Community Group Link
              </label>
              <input
                type="text"
                value={whatsappCommunityUrl}
                onChange={(e) => setWhatsappCommunityUrl(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Razorpay Payment Gateway (Mode C - Optional) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">
                Automated Gateway: Razorpay (Mode C)
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
              <input
                type="checkbox"
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Enable Gateway Mode</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_..."
                className="w-full bg-slate-800 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Security & Watermark Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">
              Anti-Piracy & Download Security
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
              <input
                type="checkbox"
                checked={enableWatermark}
                onChange={(e) => setEnableWatermark(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Automated Buyer Digital Watermarking (Anti-Leak Overlay on Delivered PDFs)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
              <input
                type="checkbox"
                checked={freeNotesRequireLogin}
                onChange={(e) => setFreeNotesRequireLogin(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Require Student Login / Lead Capture for Free Notes</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-slate-300 font-bold mb-1">
              Signed Download URL Expiration (Minutes)
            </label>
            <input
              type="number"
              value={signedUrlExpiryMinutes}
              onChange={(e) => setSignedUrlExpiryMinutes(parseInt(e.target.value, 10) || 60)}
              className="w-40 bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
            />
          </div>
        </div>

        {/* Section 5: Support & Contact Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
            Official Contact Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Support Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01]"
          >
            {saving ? "Saving Changes..." : "Save All Marketplace Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

