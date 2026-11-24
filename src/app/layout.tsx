import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "CompX – E-Notes Marketplace | Study smart. Score higher.",
  description:
    "India's premier online marketplace for handwritten topper notes, formula books & exam revision PDFs for School Boards, JEE, NEET, UPSC, B.Tech & Defence.",
  keywords: [
    "CompX",
    "notes marketplace",
    "topper notes",
    "Class 10 notes",
    "Class 12 science notes",
    "JEE physics formulas",
    "NEET biology diagrams",
    "UPSC modern history mindmaps",
    "B.Tech CSE notes",
    "free study notes PDF",
  ],
  authors: [{ name: "CompX Education" }],
  openGraph: {
    title: "CompX – E-Notes Marketplace (Free + Paid)",
    description: "Study smart. Score higher. Access verified topper notes for all Indian exams.",
    type: "website",
    locale: "en_IN",
    url: "https://compx.in",
    siteName: "CompX",
  },
};

async function getSiteSettings() {
  try {
    return await prisma.siteSetting.findUnique({ where: { id: "default" } });
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Providers>
          <StorefrontShell
            noticeBarText={settings?.noticeBarText || undefined}
            noticeBarEnabled={settings?.noticeBarEnabled ?? true}
          >
            {children}
          </StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}

