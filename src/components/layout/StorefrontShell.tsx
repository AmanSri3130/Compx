"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NoticeBar } from "./NoticeBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StudyChatbot } from "@/components/chat/StudyChatbot";

export function StorefrontShell({
  children,
  noticeBarText,
  noticeBarEnabled = true,
}: {
  children: React.ReactNode;
  noticeBarText?: string;
  noticeBarEnabled?: boolean;
}) {
  const pathname = usePathname();

  // Check if current route is part of the isolated Admin Console or Admin Auth
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/admin-login") ||
    pathname.startsWith("/admin-portal");

  // If Admin route, render 100% standalone with ZERO storefront elements
  if (isAdminRoute) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">{children}</div>;
  }

  // Regular Public Storefront: Full educational portal layout
  return (
    <>
      {/* Top Notice Bar */}
      <NoticeBar text={noticeBarText} enabled={noticeBarEnabled} />

      {/* Main Student Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* AI Study Copilot Chatbot (Groq Llama 3) */}
      <StudyChatbot />

      {/* Footer */}
      <Footer />
    </>
  );
}
