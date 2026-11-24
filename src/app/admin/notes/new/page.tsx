import React from "react";
import { NoteForm } from "@/components/admin/NoteForm";

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Upload New Academic Note</h1>
        <p className="text-xs text-slate-400 mt-1">
          Add new handwritten notes, formula cheat sheets, or question banks
        </p>
      </div>
      <NoteForm />
    </div>
  );
}

