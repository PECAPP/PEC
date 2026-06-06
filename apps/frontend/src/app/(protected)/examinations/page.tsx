import { redirect } from "next/navigation";

export default function ExaminationsRedirectPage() {
  redirect("/academic-schedule?tab=examinations");
}
