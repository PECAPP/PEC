import { prisma } from './seeds/utils';

/**
 * PEC ERP — Role & Permission Seed
 *
 * Hierarchy:  college_admin (100) > faculty (50) > student (10)
 *
 * college_admin → seeded with manage:all + every explicit permission by default,
 *                  but fully controllable via the admin UI (no CASL hardcode).
 * faculty       → academic write + institutional read (inherits from student)
 * student       → personal read + self-service writes
 */
export async function seedPermissions() {
  console.log('Seeding roles and permissions with proper hierarchy...');

  // ─── 1. Upsert all individual permission rows ─────────────────────────────

  type PermDef = {
    action: string;
    subject: string;
    description?: string;
    conditions?: Record<string, string>;
  };

  const ALL_PERMISSIONS: PermDef[] = [
    // ── Admin / system ────────────────────────────────────────────────────
    { action: 'manage', subject: 'all',                description: 'Full system access (admin only)' },
    { action: 'read',   subject: 'Admin',              description: 'Read admin dashboard stats' },
    { action: 'read',   subject: 'AuditLog',           description: 'Read audit logs' },
    { action: 'read',   subject: 'Role',               description: 'View roles' },
    { action: 'manage', subject: 'Role',               description: 'Manage roles' },
    { action: 'read',   subject: 'Permission',         description: 'View permissions' },
    { action: 'create', subject: 'Permission',         description: 'Create permissions' },
    { action: 'update', subject: 'Permission',         description: 'Update permissions' },
    { action: 'delete', subject: 'Permission',         description: 'Delete permissions' },
    { action: 'read',   subject: 'FeatureFlag',        description: 'View feature flags' },
    { action: 'manage', subject: 'FeatureFlag',        description: 'Manage feature flags' },
    // ── Users & Directory ─────────────────────────────────────────────────
    { action: 'read',   subject: 'User',               description: 'Read user directory' },
    { action: 'create', subject: 'User',               description: 'Create users' },
    { action: 'update', subject: 'User',               description: 'Update users' },
    { action: 'delete', subject: 'User',               description: 'Delete users' },
    // ── Academics ─────────────────────────────────────────────────────────
    { action: 'read',   subject: 'Course',             description: 'View courses' },
    { action: 'create', subject: 'Course',             description: 'Create courses' },
    { action: 'update', subject: 'Course',             description: 'Update courses' },
    { action: 'delete', subject: 'Course',             description: 'Delete courses' },
    { action: 'read',   subject: 'Department',         description: 'View departments' },
    { action: 'create', subject: 'Department',         description: 'Create departments' },
    { action: 'update', subject: 'Department',         description: 'Update departments' },
    { action: 'delete', subject: 'Department',         description: 'Delete departments' },
    { action: 'read',   subject: 'Enrollment',         description: 'View enrollments' },
    { action: 'create', subject: 'Enrollment',         description: 'Create enrollments' },
    { action: 'update', subject: 'Enrollment',         description: 'Update enrollments' },
    { action: 'delete', subject: 'Enrollment',         description: 'Delete enrollments' },
    { action: 'read',   subject: 'Timetable',          description: 'View timetable' },
    { action: 'create', subject: 'Timetable',          description: 'Create timetable' },
    { action: 'update', subject: 'Timetable',          description: 'Update timetable' },
    { action: 'delete', subject: 'Timetable',          description: 'Delete timetable' },
    { action: 'read',   subject: 'CourseMaterial',     description: 'View course materials' },
    { action: 'create', subject: 'CourseMaterial',     description: 'Create course materials' },
    { action: 'update', subject: 'CourseMaterial',     description: 'Update course materials' },
    { action: 'delete', subject: 'CourseMaterial',     description: 'Delete course materials' },
    // ── Attendance ────────────────────────────────────────────────────────
    { action: 'read',   subject: 'Attendance',         description: 'View attendance' },
    { action: 'create', subject: 'Attendance',         description: 'Mark attendance' },
    { action: 'update', subject: 'Attendance',         description: 'Update attendance' },
    { action: 'delete', subject: 'Attendance',         description: 'Delete attendance' },
    { action: 'manage', subject: 'Attendance',         description: 'Full attendance management' },
    { action: 'read',   subject: 'AttendanceSession',  description: 'View attendance sessions' },
    { action: 'create', subject: 'AttendanceSession',  description: 'Create attendance sessions' },
    { action: 'update', subject: 'AttendanceSession',  description: 'Update attendance sessions' },
    { action: 'delete', subject: 'AttendanceSession',  description: 'Delete attendance sessions' },
    { action: 'manage', subject: 'AttendanceSession',  description: 'Full attendance session management' },
    // ── Grading / CGPA ────────────────────────────────────────────────────
    { action: 'read',   subject: 'Grade',              description: 'View grades' },
    { action: 'create', subject: 'Grade',              description: 'Submit grades' },
    { action: 'update', subject: 'Grade',              description: 'Update grades' },
    { action: 'manage', subject: 'Grade',              description: 'Full grade management' },
    { action: 'read',   subject: 'CgpaEntry',          description: 'View CGPA entries' },
    { action: 'create', subject: 'CgpaEntry',          description: 'Create CGPA entries' },
    { action: 'update', subject: 'CgpaEntry',          description: 'Update CGPA entries' },
    { action: 'delete', subject: 'CgpaEntry',          description: 'Delete CGPA entries' },
    // ── Examinations ──────────────────────────────────────────────────────
    { action: 'read',   subject: 'Examination',        description: 'View examination schedules' },
    { action: 'create', subject: 'Examination',        description: 'Create examination schedules' },
    { action: 'update', subject: 'Examination',        description: 'Update examination schedules' },
    { action: 'delete', subject: 'Examination',        description: 'Delete examination schedules' },
    { action: 'manage', subject: 'Examination',        description: 'Full examination management' },
    // ── Faculty Bio ───────────────────────────────────────────────────────
    { action: 'read',   subject: 'FacultyBio',         description: 'View faculty bio entries' },
    { action: 'manage', subject: 'FacultyBio',         description: 'Manage own faculty bio' },
    // ── Hostel ────────────────────────────────────────────────────────────
    { action: 'read',   subject: 'HostelIssue',        description: 'View hostel issues' },
    { action: 'create', subject: 'HostelIssue',        description: 'Create hostel issues' },
    { action: 'update', subject: 'HostelIssue',        description: 'Update hostel issues' },
    { action: 'delete', subject: 'HostelIssue',        description: 'Delete hostel issues' },
    { action: 'manage', subject: 'HostelIssue',        description: 'Full hostel issue management' },
    // ── Canteen ───────────────────────────────────────────────────────────
    { action: 'read',   subject: 'CanteenItem',        description: 'View canteen items' },
    { action: 'create', subject: 'CanteenItem',        description: 'Create canteen items' },
    { action: 'update', subject: 'CanteenItem',        description: 'Update canteen items' },
    { action: 'delete', subject: 'CanteenItem',        description: 'Delete canteen items' },
    { action: 'manage', subject: 'NightCanteenItem',   description: 'Manage night canteen items' },
    // ── Marketplace ───────────────────────────────────────────────────────
    { action: 'read',   subject: 'MarketplaceListing', description: 'View marketplace listings' },
    { action: 'create', subject: 'MarketplaceListing', description: 'Create marketplace listing' },
    { action: 'update', subject: 'MarketplaceListing', description: 'Update marketplace listing' },
    { action: 'delete', subject: 'MarketplaceListing', description: 'Delete marketplace listing' },
    { action: 'manage', subject: 'MarketplaceListing', description: 'Manage own marketplace listings' },
    // ── Finance ───────────────────────────────────────────────────────────
    { action: 'read',   subject: 'FeeRecord',          description: 'View fee records' },
    { action: 'manage', subject: 'FeeRecord',          description: 'Manage fee records' },
    // ── Campus ────────────────────────────────────────────────────────────
    { action: 'read',   subject: 'Room',               description: 'View rooms' },
    { action: 'create', subject: 'Room',               description: 'Create rooms' },
    { action: 'update', subject: 'Room',               description: 'Update rooms' },
    { action: 'delete', subject: 'Room',               description: 'Delete rooms' },
    { action: 'read',   subject: 'CampusMap',          description: 'View campus map' },
    // ── Noticeboard ───────────────────────────────────────────────────────
    { action: 'read',   subject: 'Notice',             description: 'View notices' },
    { action: 'create', subject: 'Notice',             description: 'Create notices' },
    { action: 'update', subject: 'Notice',             description: 'Update notices' },
    { action: 'delete', subject: 'Notice',             description: 'Delete notices' },
  ];

  const createdPerms: Record<string, any> = {};

  for (const p of ALL_PERMISSIONS) {
    const key = `${p.action}:${p.subject}`;
    const perm = await (prisma as any).permission.upsert({
      where: { action_subject: { action: p.action, subject: p.subject } },
      update: { description: p.description },
      create: { action: p.action, subject: p.subject, description: p.description, conditions: p.conditions ?? null },
    });
    createdPerms[key] = perm;
  }

  console.log(`  ✓ Upserted ${Object.keys(createdPerms).length} permission rows.`);

  // ─── Helper to get a perm by key ──────────────────────────────────────────

  const perm = (action: string, subject: string) => createdPerms[`${action}:${subject}`];

  const grantToRole = async (roleId: string, perms: (any | undefined)[]) => {
    for (const p of perms) {
      if (!p) continue;
      await (prisma as any).rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: p.id } },
        update: {},
        create: { roleId, permissionId: p.id },
      });
    }
  };

  // ─── 2. Upsert system roles ───────────────────────────────────────────────

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: { hierarchy: 10, isSystem: true, description: 'Student — personal read + self-service writes' },
    create: { name: 'student', hierarchy: 10, isSystem: true, description: 'Student — personal read + self-service writes' },
  });

  const facultyRole = await prisma.role.upsert({
    where: { name: 'faculty' },
    update: { hierarchy: 50, isSystem: true, parentRoleId: studentRole.id, description: 'Faculty — academic write + institutional read' },
    create: { name: 'faculty', hierarchy: 50, isSystem: true, parentRoleId: studentRole.id, description: 'Faculty — academic write + institutional read' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'college_admin' },
    // parentRoleId is intentionally NULL — admin does NOT inherit faculty permissions.
    // Admin permissions are seeded explicitly below and are fully editable via the UI.
    update: { hierarchy: 100, isSystem: true, isSystemAdmin: true, parentRoleId: null, description: 'Full system administrator' },
    create: { name: 'college_admin', hierarchy: 100, isSystem: true, isSystemAdmin: true, description: 'Full system administrator' },
  });


  // ─── 3. Admin → ALL permissions explicitly (✔ seeded, ✔ controllable via UI) ──────────
  //
  // college_admin is seeded with every permission (including manage:all).
  // Because admin has NO parentRoleId, it does NOT inherit from faculty.
  // All permissions here are explicit DB rows — fully editable in the admin UI.

  const ALL_PERM_KEYS = Object.keys(createdPerms);
  await grantToRole(adminRole.id, ALL_PERM_KEYS.map(k => createdPerms[k]));
  console.log(`  ✓ college_admin explicitly granted ALL ${ALL_PERM_KEYS.length} permissions (fully controllable via UI).`);


  // ─── 4. Faculty → scoped permissions ─────────────────────────────────────
  //  Academic write access + read everything (not admin-management perms)
  //  Inherits student permissions automatically via parentRoleId

  await grantToRole(facultyRole.id, [
    // Academic writes
    perm('manage', 'Attendance'),
    perm('manage', 'AttendanceSession'),
    perm('manage', 'CourseMaterial'),
    perm('manage', 'Grade'),
    perm('manage', 'Examination'),
    perm('manage', 'FacultyBio'),
    perm('manage', 'NightCanteenItem'),
    // Read access — institutional data not covered by student
    perm('read', 'Admin'),       // read-only dashboard stats
    perm('read', 'Role'),        // read roles list
    perm('read', 'Permission'),  // read permissions list
    // Noticeboard write (faculty can post notices)
    perm('create', 'Notice'),
    perm('update', 'Notice'),
  ]);
  console.log(`  ✓ faculty granted scoped permissions (academic write + institutional read).`);

  // ─── 5. Student → read-only + self-service ────────────────────────────────

  await grantToRole(studentRole.id, [
    // Core reads
    perm('read', 'User'),
    perm('read', 'Course'),
    perm('read', 'Department'),
    perm('read', 'Enrollment'),
    perm('read', 'Timetable'),
    perm('read', 'CourseMaterial'),
    perm('read', 'MarketplaceListing'),
    perm('read', 'CanteenItem'),
    perm('read', 'Room'),
    perm('read', 'CampusMap'),
    perm('read', 'Notice'),
    perm('read', 'FeatureFlag'),
    perm('read', 'Examination'),
    perm('read', 'Attendance'),
    perm('read', 'AttendanceSession'),
    perm('read', 'FeeRecord'),
    perm('read', 'Grade'),
    perm('read', 'CgpaEntry'),
    perm('read', 'HostelIssue'),
    perm('read', 'FacultyBio'),
    // Self-service writes
    perm('create', 'MarketplaceListing'),
    perm('update', 'MarketplaceListing'),
    perm('delete', 'MarketplaceListing'),
    perm('create', 'HostelIssue'),
    perm('update', 'HostelIssue'),
    perm('create', 'Enrollment'),
    perm('update', 'Enrollment'),
    perm('delete', 'Enrollment'),
    perm('create', 'CgpaEntry'),
    perm('update', 'CgpaEntry'),
    perm('delete', 'CgpaEntry'),
    perm('create', 'Attendance'),  // mark own attendance
  ]);
  console.log(`  ✓ student granted read + self-service permissions.`);

  // ─── 6. Back-fill UserRole join rows for existing users ───────────────────

  const rolesMap: Record<string, string> = {
    college_admin: adminRole.id,
    faculty: facultyRole.id,
    student: studentRole.id,
  };

  for (const [roleName, roleId] of Object.entries(rolesMap)) {
    const usersWithRole = await prisma.user.findMany({
      where: { role: roleName },
      select: { id: true },
    });
    for (const user of usersWithRole) {
      await (prisma as any).userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
    if (usersWithRole.length > 0) {
      console.log(`  ✓ Back-filled UserRole for ${usersWithRole.length} ${roleName} user(s).`);
    }
  }

  console.log('\n✅  Role & permission seed complete.\n');
}

if (require.main === module) {
  seedPermissions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
