"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import TimetableTab from "@/features/academic-schedule/TimetableTab";
import CalendarTab from "@/features/academic-schedule/CalendarTab";
import ExaminationsTab from "@/features/academic-schedule/ExaminationsTab";

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

  const activeTab = searchParams.get("tab") || "timetable";

  const handleTabChange = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-0"
    >
      {/* Compact Page Header */}
      <div className="flex items-center gap-3 pb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
            Academic Schedule
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Timetable · Calendar · Examinations
          </p>
        </div>
      </div>

      {/* Underline-style Tab Bar */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 relative border-b-2 -mb-px",
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5", isActive && "text-primary")} />
                {tab.label}
                {isPending && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === "timetable" && <TimetableTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "examinations" && <ExaminationsTab />}
      </div>
    </motion.div>
  );
}
