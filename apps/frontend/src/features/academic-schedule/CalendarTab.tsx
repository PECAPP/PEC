"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { InteractiveCalendar } from "@/features/academic-calendar/InteractiveCalendar";
import AdminAcademicCalendarPage from "@/app/(protected)/admin/academic-calendar/page";
import api from "@/lib/api";

export default function CalendarTab() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = ["college_admin", "super_admin", "admin"].includes(
    user?.role || ""
  );

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      setLoading(false);
      return;
    }

    async function loadEvents() {
      try {
        const response = await api.get("/academic-calendar");
        const data = response.data?.data ?? response.data ?? [];
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin) {
    return <AdminAcademicCalendarPage />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <InteractiveCalendar events={events || []} isAdmin={false} />
    </div>
  );
}
