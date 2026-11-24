import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, MessageCircle, Send, Mail, Phone, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Comp<span className="text-indigo-400">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India's premier digital notes marketplace. Access verified handwritten topper notes, formula books, and chapter-wise question banks for School, Entrance & Competitive exams.
            </p>
            <p className="text-xs font-semibold text-indigo-400">
              Study smart. Score higher. 🇮🇳
            </p>

            {/* Social & Community links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://chat.whatsapp.com/CDeKmgE9qY97JgJeOVjUTQ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-400 flex items-center justify-center transition"
                title="WhatsApp Study Community"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/compx_notes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-sky-950/80 hover:bg-sky-800 text-sky-400 flex items-center justify-center transition"
                title="Telegram Channel"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@compx.in"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                title="Email Support"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Top Exams & Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/browse?category=school" className="hover:text-indigo-400 transition">
                  Class 10 & 12 Board Notes
                </Link>
              </li>
              <li>
                <Link href="/browse?category=engineering-medical-entrance" className="hover:text-indigo-400 transition">
                  JEE Main & NEET Formula Sheets
                </Link>
              </li>
              <li>
                <Link href="/browse?category=government-civil-services" className="hover:text-indigo-400 transition">
                  UPSC CSE Prelims & Mains
                </Link>
              </li>
              <li>
                <Link href="/browse?category=btech-engineering" className="hover:text-indigo-400 transition">
                  B.Tech CSE / IT / AI Semesters
                </Link>
              </li>
              <li>
                <Link href="/browse?category=government-civil-services" className="hover:text-indigo-400 transition">
                  NDA, CDS & AFCAT Defence
                </Link>
              </li>
              <li>
                <Link href="/browse?type=free" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition">
                  <span>✨ 100% Free Notes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Student Zone
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account/library" className="hover:text-indigo-400 transition">
                  My Library
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-400 transition">
                  Cart & Checkout
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-indigo-400 transition">
                  Track Payment / Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-400 transition">
                  Payment Verification FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition">
                  Student Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Policies & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  About CompX
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-indigo-400 font-semibold text-amber-300/90 transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-indigo-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-indigo-400 transition">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-indigo-400 transition">
                  Academic Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Accepted Payment Modes:</span>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-1 rounded">UPI</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-1 rounded">GPay</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-1 rounded">PhonePe</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-1 rounded">Paytm</span>
              <span className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold px-2 py-1 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} CompX Technologies. All rights reserved. Made for Indian Students.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

