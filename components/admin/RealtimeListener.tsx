"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export function RealtimeListener() {
  const { addToast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        (payload) => {
          const app = payload.new as { full_name?: string; course_applied?: string };
          const name = app?.full_name || "New Applicant";
          const course = app?.course_applied || "a program";
          addToast(`📋 New application from ${name} for ${course}`, "info");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications" },
        (payload) => {
          const app = payload.new as { full_name?: string; status?: string };
          const oldApp = payload.old as { status?: string };
          if (app?.status !== oldApp?.status) {
            addToast(`🔄 ${app?.full_name || "Application"} status changed to ${app?.status}`, "success");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast]);

  return null;
}
