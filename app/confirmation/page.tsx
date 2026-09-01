import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ConfirmationContent } from "@/components/forms/ConfirmationContent";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Application Received",
  description: "Your Academic Excellence application dossier and payment proof have been successfully registered.",
};

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
