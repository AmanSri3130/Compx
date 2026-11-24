import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ContactForm } from "./ContactForm";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    select: { title: true, metaTitle: true, metaDescription: true },
  });

  if (!page) return { title: "Page Not Found – CompX" };

  return {
    title: `${page.metaTitle || page.title} | CompX`,
    description: page.metaDescription || `Read ${page.title} on CompX Education.`,
  };
}

export default async function DynamicCmsPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });

  if (!page) {
    notFound();
  }

  const isContactPage = page.slug === "contact";

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/40 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{page.title}</span>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-12 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {page.title}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Last updated on {formatDate(page.updatedAt)} • CompX Education
            </p>
          </div>

          {/* Body */}
          <div
            className="prose dark:prose-invert max-w-none text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Interactive Contact Form if on /contact page */}
          {isContactPage && (
            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Send Us a Direct Message
              </h3>
              <ContactForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

