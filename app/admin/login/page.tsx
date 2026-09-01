import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Evaluator Sign In",
  description: "Sign in to review Academic Excellence admissions applications and FAYDA documentation.",
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 relative">
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Academic Excellence
        </Link>
      </div>

      <AdminLoginForm />
    </main>
  );
}
