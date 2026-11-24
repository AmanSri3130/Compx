import React from "react";
import { Star, CheckCircle, GraduationCap } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Aarav Sharma",
      exam: "CBSE Class 10 Board",
      score: "Scored 96.4% in Science",
      comment:
        "The handwritten Class 10 Science notes with color-coded ray diagrams and chemical equation tricks were a lifesaver! I revised everything 3 days before the exam.",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Priya Nair",
      exam: "JEE Main 2026",
      score: "99.2 Percentile in Physics",
      comment:
        "Kota faculty formula sheets helped me solve the physics paper in under 45 minutes. The shortcut derivations are pure gold. Highly recommend to every aspirant!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Rohan Mukherjee",
      exam: "UPSC CSE Aspirant",
      score: "Cleared Prelims 2026",
      comment:
        "The Modern Indian History chronological mindmaps condensed Spectrum into easy visual maps. Memorizing governor-generals and tribal revolts was effortless.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Sneha Patel",
      exam: "B.Tech CSE Semester 4",
      score: "9.4 CGPA in OS & DBMS",
      comment:
        "Instant delivery via UPI QR! The semester notes directly answered the 10-mark university questions with neat diagrams. Best ₹89 ever spent.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Loved by 50,000+ Students Across India
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Real feedback from students preparing for Boards, JEE, NEET, UPSC, and Engineering semesters.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-700 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                    {t.score}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{t.exam}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

