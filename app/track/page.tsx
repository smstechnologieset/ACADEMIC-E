import { Metadata } from "next";
import { TrackApplicationContent } from "@/components/forms/TrackApplicationContent";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Track Your Application | Academic Excellence Ethiopia",
  description:
    "Check real-time admissions status, verification milestones, and enrollment progress using your official Academic Excellence Reference ID.",
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: "Track Application Status | Academic Excellence",
    description: "Enter your Application Reference ID to check live verification milestones and enrollment status.",
    url: `${siteConfig.url}/track`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Application Status | Academic Excellence",
    description: "Check live admissions status and verification milestones.",
  },
};

export default function TrackPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Track Application",
        "item": `${siteConfig.url}/track`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TrackApplicationContent />
    </>
  );
}
