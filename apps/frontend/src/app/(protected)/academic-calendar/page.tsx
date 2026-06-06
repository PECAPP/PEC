import { redirect } from "next/navigation";

export default function AcademicCalendarRedirectPage() {
  redirect("/academic-schedule?tab=calendar");
}
