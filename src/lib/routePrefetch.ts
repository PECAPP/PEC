const routeImportMap: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("@/pages/Dashboard"),
  "/chat": () => import("@/pages/Chat"),
  "/users": () => import("@/pages/Users"),
  "/profile": () => import("@/pages/StudentProfile"),
  "/courses": () => import("@/features/courses/pages/CoursesPage"),
  "/course-materials": () =>
    import("@/features/courses/pages/CourseMaterialsPage"),
  "/timetable": () => import("@/pages/Timetable"),
  "/attendance": () => import("@/pages/Attendance"),
  "/examinations": () => import("@/pages/Examinations"),
  "/resume-builder": () => import("@/pages/ResumeBuilderIvyLeague"),
  "/hostel-issues": () => import("@/pages/HostelIssues"),
  "/canteen": () => import("@/pages/NightCanteen"),
  "/campus-map": () => import("@/pages/CampusMap"),
  "/settings": () => import("@/pages/Settings"),
  "/help": () => import("@/pages/Help"),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string) {
  const importer = routeImportMap[path];
  if (!importer || prefetched.has(path)) return;

  prefetched.add(path);
  importer().catch(() => {
    prefetched.delete(path);
  });
}
