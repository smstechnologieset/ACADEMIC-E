import React from "react";
import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Shield } from "lucide-react";
import { siteConfig } from "@/lib/content";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">{siteConfig.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{siteConfig.description}</p>
            <div className="pt-1 text-[11px] text-blue-400 font-semibold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Official Higher Education Access Initiative</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs mb-4 tracking-wider uppercase">Institutional Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  About & Vision
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-white transition-colors">
                  Job-Ready Programs (120+)
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Admissions Process
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-blue-400 hover:underline flex items-center font-bold">
                  Apply with FAYDA ID <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div>
            <h4 className="text-white font-bold text-xs mb-4 tracking-wider uppercase">Admissions Desk</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{siteConfig.contactEmail}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with subtle Shield icon for admin */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">In collaboration with N, RI, and University in New York</span>
            {/* Admin entry point represented solely as a shield icon */}
            <Link
              href="/admin/login"
              title="Registry Access"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-colors"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
