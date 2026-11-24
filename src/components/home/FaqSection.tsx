"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I download my notes after payment?",
      a: "Immediately upon payment verification (usually within 5 to 15 minutes for UPI QR, or instant for free notes), your notes are automatically unlocked in your personal 'My Library'. You can view them online in our browser viewer or download them directly to your device with a single click. Your library access never expires!",
    },
    {
      q: "How does the manual UPI QR code payment mode work?",
      a: "At checkout, select 'UPI QR Code'. We generate a dynamic QR code pre-filled with the exact amount and Order ID, along with our official UPI ID and a 'Pay via Any UPI App' button (opens Google Pay, PhonePe, or Paytm). After paying, simply copy the 12-digit UTR / Transaction Reference ID from your UPI app, paste it into the box, and upload your payment screenshot. Our team verifies it and unlocks your note.",
    },
    {
      q: "Can I pay and receive notes directly on WhatsApp?",
      a: "Yes! Select 'Pay via WhatsApp' at checkout. Clicking the button opens a direct chat with our verified team on WhatsApp with your Order ID and selected note titles pre-filled. You can send your payment confirmation or ask questions directly, and we will activate your notes right away.",
    },
    {
      q: "Are the free notes completely free without hidden charges?",
      a: "100% yes! We believe in accessible education. Every note tagged with the green '100% FREE' badge can be downloaded instantly at zero cost. We provide free formula cheat sheets, math theorem proofs, and quick python guides.",
    },
    {
      q: "Can I print the downloaded PDF notes for offline self-study?",
      a: "Yes, all downloaded PDFs are formatted in high-contrast, clean A4 layout with margins, making them perfect for printing at your local xerox/print shop or studying on tablets and laptops.",
    },
    {
      q: "What if I face an issue with my transaction or entered the wrong UTR?",
      a: "Don't worry! Our student support team is available on WhatsApp at +91 98765 43210 and email at support@compx.in. Simply message us your registered email or Order ID, and we will sort it out promptly.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything you need to know about purchasing, UPI QR codes, and downloading notes on CompX
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

