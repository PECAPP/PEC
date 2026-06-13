"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import TimetableTab from "@/features/academic-schedule/TimetableTab";
import CalendarTab from "@/features/academic-schedule/CalendarTab";
import ExaminationsTab from "@/features/academic-schedule/ExaminationsTab";
import AdminCalendarTab from "./AdminCalendarTab";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { PageBanner, Tabs, TabsList, TabsTrigger } from "@pec/ui";

const tabs = [
  {
    id: "timetable",
    label: "Timetable",
    icon: Clock,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    id: "examinations",
    label: "Examinations",
    icon: BarChart3,
  },
];

export default function AcademicSchedulePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { ability } = useAuth();

  const activeTab = searchParams.get("tab") || "timetable";

  const handleTabChange = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${pathname}?${params.toString()}` as any, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col h-full space-y-6 w-full">
      <PageBanner
        title="Academic Schedule"
        subtitle="Manage your timetable, calendar events, and examinations."
        icon={<Calendar className="w-8 h-8 text-primary" />}
      />

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="mb-6">
            <TabsList>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <tab.icon className={cn("w-3.5 h-3.5 mr-1.5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    {tab.label}
                    {isPending && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1.5" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "timetable" && <TimetableTab />}
        {activeTab === "calendar" && (
          ability?.can('manage', 'all' as any) ? <AdminCalendarTab /> : <CalendarTab />
        )}
        {activeTab === "examinations" && <ExaminationsTab />}
      </div>
        </Tabs>
      </div>
    </div>
  );
}
