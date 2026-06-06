// Async server component — streams admin dashboard data independently.
import { serverFetch } from '@/lib/server-data';
import { AdminDashboard } from '../dashboards/AdminDashboard';

export async function AdminDataSlot() {
  const [courses, users, stats] = await Promise.all([
    serverFetch('/courses?limit=10'),
    serverFetch('/users?limit=10'),
    serverFetch('/admin/dashboard-stats'),
  ]);

  return (
    <AdminDashboard
      initialData={{
        stats: stats || { totalStudents: 0, totalFaculty: 0, totalCourses: 0 },
        courses,
        users,
      }}
    />
  );
}
