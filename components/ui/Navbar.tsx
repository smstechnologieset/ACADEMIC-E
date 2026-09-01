"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {siteConfig.name}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 -mt-1">
                Ethiopian Admissions Intake
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <Link href="/#about" className="hover:text-blue-600 transition-colors">
              About & Vision
            </Link>
            <Link href="/#courses" className="hover:text-blue-600 transition-colors flex items-center">
              <span>Programs & Courses</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                120+
              </span>
            </Link>
            <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </Link>
            <Link href="/#contact-us" className="hover:text-blue-600 transition-colors">
              Contact Desk
            </Link>
          </div>

          {/* Primary Action CTA */}
          <div className="hidden md:flex items-center">
            <Link href="/apply">
              <Button size="md" className="group shadow-md shadow-blue-600/20">
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-blue-600 py-2 font-semibold"
          >
            About & Vision
          </Link>
          <Link
            href="/#courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-blue-600 py-2 font-semibold"
          >
            Programs & Courses (120+)
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-blue-600 py-2 font-semibold"
          >
            How It Works
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-blue-600 py-2 font-semibold"
          >
            FAQ
          </Link>
          <Link
            href="/#contact-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-blue-600 py-2 font-semibold"
          >
            Contact Desk
          </Link>
          <div className="pt-4 border-t border-slate-200">
            <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center shadow-md shadow-blue-600/20">
                Start Application
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
