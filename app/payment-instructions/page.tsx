import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PaymentInstructionsContent } from "@/components/forms/PaymentInstructionsContent";
import { getCmsSiteSettings } from "@/lib/cms-repo";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Subsidized Payment Instructions | Academic Excellence",
  description: "Telebirr & bank transfer details and deposit receipt upload for Academic Excellence applicants.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function PaymentInstructionsPage() {
  const settings = await getCmsSiteSettings();

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">
            Academic Excellence Admissions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Subsidized Tuition Processing
          </h1>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Choose your preferred payment method (Telebirr, CBE, Awash, etc.), complete the deposit, and attach your transaction screenshot.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <PaymentInstructionsContent dynamicSettings={settings} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
