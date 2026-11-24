import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Atom,
  Landmark,
  Cpu,
  BookOpen,
  Award,
  ArrowRight,
  Shield,
  Briefcase,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: { notes: number };
}

export function CategoryCards({ categories }: { categories?: Category[] }) {
  const defaultCategories = [
    {
      name: "School (Class 6 - 12)",
      slug: "school",
      icon: "🏫",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
      description: "Class 10 & 12 Board Topper Handwritten Notes (PCM, PCB, Commerce, Arts)",
      count: "180+ Notes",
    },
    {
      name: "Engineering & Medical Entrance",
      slug: "engineering-medical-entrance",
      icon: "⚡",
      color: "from-orange-500 to-amber-600",
      bgLight: "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
      description: "JEE Main, JEE Advanced, NEET, BITSAT formula booklets & Kota shortcuts",
      count: "240+ Notes",
    },
    {
      name: "Government & Civil Services",
      slug: "government-civil-services",
      icon: "🏛️",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
      description: "UPSC CSE Prelims & Mains mindmaps, SSC CGL, Banking (IBPS, SBI), Railways",
      count: "310+ Notes",
    },
    {
      name: "Defence Services",
      slug: "government-civil-services",
      icon: "🎖️",
      color: "from-red-500 to-rose-600",
      bgLight: "bg-red-50 dark:bg-red-950/40 text-red-600",
      description: "NDA, CDS, AFCAT, Agniveer, CAPF written exam shortcuts & GK capsules",
      count: "95+ Notes",
    },
    {
      name: "B.Tech (All Branches)",
      slug: "btech-engineering",
      icon: "💻",
      color: "from-purple-500 to-indigo-700",
      bgLight: "bg-purple-50 dark:bg-purple-950/40 text-purple-600",
      description: "CSE, IT, AI/ML, Data Science, ECE, Mechanical, Civil semester notes & PYQs",
      count: "215+ Notes",
    },
    {
      name: "Graduation & Masters",
      slug: "graduation-masters",
      icon: "📚",
      color: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600",
      description: "BCA, MCA, BBA, MBA, B.Com, B.Sc semester-wise study material",
      count: "120+ Notes",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md mb-2">
              <span>Structured For Indian Syllabi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Explore by Exam & Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Choose your target exam to find syllabus-aligned notes and revision sheets
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline group shrink-0"
          >
            <span>View All Streams</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {defaultCategories.map((cat) => (
            <Link
              key={cat.name}
              href={`/browse?category=${cat.slug}`}
              className="group relative p-6 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    {cat.count}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Browse Notes</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

