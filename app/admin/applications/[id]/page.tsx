import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getApplicationById } from "@/lib/applications-repo";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationDetailClient } from "@/components/admin/ApplicationDetailClient";
import type { ApplicationEvent } from "@/types";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Review Application ${id}`,
  };
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  let events: ApplicationEvent[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("application_events")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: true });
    if (data) events = data as ApplicationEvent[];
  } catch {
    // Ignore error
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <ApplicationDetailClient application={application} events={events} />
    </main>
  );
}
