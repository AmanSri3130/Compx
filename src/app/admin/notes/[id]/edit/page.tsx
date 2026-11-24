import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { NoteForm } from "@/components/admin/NoteForm";

export default async function EditNotePage({ params }: { params: { id: string } }) {
  const note = await prisma.note.findUnique({
    where: { id: params.id },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Edit Academic Note</h1>
        <p className="text-xs text-slate-400 mt-1">
          Update pricing, replace PDF files, or modify description for "{note.title}"
        </p>
      </div>
      <NoteForm initialData={note} />
    </div>
  );
}

