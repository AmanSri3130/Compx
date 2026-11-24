"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  BookOpen,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  FolderLock,
  PackageCheck,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Comp<span className="text-indigo-600 dark:text-indigo-400">X</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-1.5 py-0.2 rounded-full">
                  India
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block tracking-wide">
                Study smart. Score higher.
              </p>
            </div>
          </Link>

          {/* Categories Dropdown & Quick Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase text-slate-400">Browse by Exam & Stream</p>
                  </div>
                  <Link
                    href="/browse?category=school"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  >
                    <span className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 rounded-lg">🏫</span>
                    <div>
                      <p className="font-semibold">School (Class 6 - 12)</p>
                      <p className="text-xs text-slate-400">CBSE, ICSE, Board Topper Notes</p>
                    </div>
                  </Link>
                  <Link
                    href="/browse?category=engineering-medical-entrance"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  >
                    <span className="p-1.5 bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300 rounded-lg">⚡</span>
                    <div>
                      <p className="font-semibold">JEE & NEET Entrance</p>
                      <p className="text-xs text-slate-400">Formulas, Kota Notes, BITSAT</p>
                    </div>
                  </Link>
                  <Link
                    href="/browse?category=government-civil-services"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  >
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">🏛️</span>
                    <div>
                      <p className="font-semibold">UPSC & Govt Exams</p>
                      <p className="text-xs text-slate-400">IAS Prelims/Mains, SSC, Banking</p>
                    </div>
                  </Link>
                  <Link
                    href="/browse?category=btech-engineering"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  >
                    <span className="p-1.5 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300 rounded-lg">💻</span>
                    <div>
                      <p className="font-semibold">B.Tech Engineering</p>
                      <p className="text-xs text-slate-400">CSE, IT, AI, Mechanical, Civil Semesters</p>
                    </div>
                  </Link>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                    <Link
                      href="/browse"
                      className="block text-center py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/browse?type=free"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Free Notes</span>
            </Link>

            <Link
              href="/browse"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-lg transition"
            >
              Browse All
            </Link>
          </div>

          {/* Instant Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md relative hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects (e.g. JEE Physics, UPSC History, Class 10)..."
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-full pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Right Action Icons: Cart, Account, Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <Link
              href="/search"
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition group"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition bg-slate-50 dark:bg-slate-800/60"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                      {user.name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium capitalize">
                      {user.role === "STUDENT" ? "Student" : user.role.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Student Dashboard</span>
                    </Link>

                    <Link
                      href="/account/library"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                    >
                      <FolderLock className="w-4 h-4 text-indigo-500" />
                      <span>My Library</span>
                      <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                        Notes
                      </span>
                    </Link>

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>Order History & Invoices</span>
                    </Link>

                    <Link
                      href="/account/wishlist"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Saved Notes</span>
                    </Link>

                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, exams..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </form>

          <div className="space-y-1 pt-2">
            <Link
              href="/browse?type=free"
              className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl"
            >
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Free Study Material</span>
            </Link>

            <Link
              href="/browse"
              className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>Browse All Notes</span>
            </Link>

            <Link
              href="/browse?category=school"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl ml-2"
            >
              <span>🏫</span>
              <span>School (Class 6 - 12)</span>
            </Link>

            <Link
              href="/browse?category=engineering-medical-entrance"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl ml-2"
            >
              <span>⚡</span>
              <span>JEE & NEET Entrance</span>
            </Link>

            <Link
              href="/browse?category=government-civil-services"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl ml-2"
            >
              <span>🏛️</span>
              <span>UPSC & Govt Services</span>
            </Link>

            <Link
              href="/browse?category=btech-engineering"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl ml-2"
            >
              <span>💻</span>
              <span>B.Tech All Branches</span>
            </Link>
          </div>

          {user ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 rounded-xl"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Student Dashboard</span>
              </Link>
              <Link
                href="/account/library"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl"
              >
                <FolderLock className="w-5 h-5 text-slate-400" />
                <span>My Library (Access Notes)</span>
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-xl"
              >
                <PackageCheck className="w-5 h-5 text-slate-400" />
                <span>My Orders & Invoices</span>
              </Link>
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
              <Link
                href="/auth/login"
                className="text-center py-2.5 text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="text-center py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* WhatsApp Support Button */}
          <div className="pt-3">
            <a
              href="https://wa.me/919876543210?text=Hello%20CompX%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Student Helpline</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

