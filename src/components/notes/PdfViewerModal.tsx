"use client";

import React, { useEffect } from "react";
import { X, ShieldAlert, Eye, Lock } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  isSample?: boolean;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  title,
  pdfUrl,
  isSample = true,
}: PdfViewerModalProps) {
  useEffect(() => {
    // Prevent right-click deterrent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("contextmenu", handleContextMenu);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1.5 bg-indigo-600/30 text-indigo-400 rounded-lg shrink-0">
              <Eye className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {isSample ? (
                  <span className="text-amber-400 font-semibold">Sample Pages Preview</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Full Licensed Note</span>
                )}
                <span>• CompX Anti-Piracy Protection Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame with Watermark Deterrent */}
        <div className="relative flex-1 bg-slate-800 w-full h-full overflow-hidden">
          {/* Subtle Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around items-center opacity-15 overflow-hidden select-none">
            <span className="text-xl sm:text-2xl font-black text-white transform -rotate-25 tracking-widest">
              COMPX EDUCATION • PREVIEW COPY • DO NOT DISTRIBUTE
            </span>
            <span className="text-xl sm:text-2xl font-black text-white transform -rotate-25 tracking-widest">
              COMPX EDUCATION • PREVIEW COPY • DO NOT DISTRIBUTE
            </span>
            <span className="text-xl sm:text-2xl font-black text-white transform -rotate-25 tracking-widest">
              COMPX EDUCATION • PREVIEW COPY • DO NOT DISTRIBUTE
            </span>
          </div>

          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-none"
            title="Note PDF Preview"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Right-click and printing disabled for copyright protection.</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">CompX Digital Rights Management</span>
        </div>
      </div>
    </div>
  );
}

