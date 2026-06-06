import { redirect } from "next/navigation";

export default function TimetableRedirectPage() {
  redirect("/academic-schedule?tab=timetable");
}
