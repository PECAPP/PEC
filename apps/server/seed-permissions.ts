import { prisma } from './seeds/utils';

export async function seedPermissions() {
  console.log('Seeding all permissions...');

  // Every subject used across all controllers
  const permissionsData = [
    // Attendance
    { action: 'read', subject: 'Attendance', description: 'View attendance' },
    { action: 'create', subject: 'Attendance', description: 'Create attendance' },
    { action: 'update', subject: 'Attendance', description: 'Update attendance' },
    { action: 'delete', subject: 'Attendance', description: 'Delete attendance' },
    // AttendanceSession
    { action: 'read', subject: 'AttendanceSession', description: 'View attendance sessions' },
    { action: 'create', subject: 'AttendanceSession', description: 'Create attendance sessions' },
    { action: 'update', subject: 'AttendanceSession', description: 'Update attendance sessions' },
    { action: 'delete', subject: 'AttendanceSession', description: 'Delete attendance sessions' },
    // Timetable
    { action: 'read', subject: 'Timetable', description: 'View timetable' },
    { action: 'create', subject: 'Timetable', description: 'Create timetable' },
    { action: 'update', subject: 'Timetable', description: 'Update timetable' },
    { action: 'delete', subject: 'Timetable', description: 'Delete timetable' },
    // Course
    { action: 'read', subject: 'Course', description: 'View courses' },
    // Notice
    { action: 'read', subject: 'Notice', description: 'View notices' },
    { action: 'create', subject: 'Notice', description: 'Create notices' },
    { action: 'update', subject: 'Notice', description: 'Update notices' },
    { action: 'delete', subject: 'Notice', description: 'Delete notices' },
    // FeeRecord
    { action: 'read', subject: 'FeeRecord', description: 'View fees' },
    // MarketplaceListing
    { action: 'read', subject: 'MarketplaceListing', description: 'View marketplace' },
    { action: 'create', subject: 'MarketplaceListing', description: 'Create marketplace listing' },
    { action: 'update', subject: 'MarketplaceListing', description: 'Update marketplace listing' },
    { action: 'delete', subject: 'MarketplaceListing', description: 'Delete marketplace listing' },
    // HostelIssue
    { action: 'read', subject: 'HostelIssue', description: 'View hostel issues' },
    { action: 'create', subject: 'HostelIssue', description: 'Create hostel issues' },
    { action: 'update', subject: 'HostelIssue', description: 'Update hostel issues' },
    { action: 'delete', subject: 'HostelIssue', description: 'Delete hostel issues' },
    // CanteenItem (Night Canteen)
    { action: 'read', subject: 'CanteenItem', description: 'View canteen items' },
    { action: 'create', subject: 'CanteenItem', description: 'Create canteen items' },
    { action: 'update', subject: 'CanteenItem', description: 'Update canteen items' },
    { action: 'delete', subject: 'CanteenItem', description: 'Delete canteen items' },
    // Room
    { action: 'read', subject: 'Room', description: 'View rooms' },
    { action: 'create', subject: 'Room', description: 'Create rooms' },
    { action: 'update', subject: 'Room', description: 'Update rooms' },
    { action: 'delete', subject: 'Room', description: 'Delete rooms' },
    // FeatureFlag
    { action: 'read', subject: 'FeatureFlag', description: 'View feature flags' },
    { action: 'create', subject: 'FeatureFlag', description: 'Create feature flags' },
    // Examination
    { action: 'read', subject: 'Examination', description: 'View examinations' },
    { action: 'create', subject: 'Examination', description: 'Create examinations' },
    { action: 'delete', subject: 'Examination', description: 'Delete examinations' },
    // Enrollment
    { action: 'read', subject: 'Enrollment', description: 'View enrollments' },
    { action: 'create', subject: 'Enrollment', description: 'Create enrollments' },
    { action: 'update', subject: 'Enrollment', description: 'Update enrollments' },
    { action: 'delete', subject: 'Enrollment', description: 'Delete enrollments' },
    // Department
    { action: 'read', subject: 'Department', description: 'View departments' },
    { action: 'create', subject: 'Department', description: 'Create departments' },
    { action: 'update', subject: 'Department', description: 'Update departments' },
    { action: 'delete', subject: 'Department', description: 'Delete departments' },
    // CgpaEntry
    { action: 'read', subject: 'CgpaEntry', description: 'View CGPA entries' },
    { action: 'create', subject: 'CgpaEntry', description: 'Create CGPA entries' },
    { action: 'update', subject: 'CgpaEntry', description: 'Update CGPA entries' },
    { action: 'delete', subject: 'CgpaEntry', description: 'Delete CGPA entries' },
    // CampusMap
    { action: 'read', subject: 'CampusMap', description: 'View campus map' },
    { action: 'create', subject: 'CampusMap', description: 'Create campus map entries' },
    { action: 'update', subject: 'CampusMap', description: 'Update campus map entries' },
    { action: 'delete', subject: 'CampusMap', description: 'Delete campus map entries' },
    // Admin
    { action: 'read', subject: 'Admin', description: 'View admin dashboard' },
    // Role management
    { action: 'read', subject: 'Role', description: 'View roles' },
    { action: 'manage', subject: 'Role', description: 'Manage roles' },
    // Permission management
    { action: 'read', subject: 'Permission', description: 'View permissions' },
    { action: 'create', subject: 'Permission', description: 'Create permissions' },
    { action: 'update', subject: 'Permission', description: 'Update permissions' },
    { action: 'delete', subject: 'Permission', description: 'Delete permissions' },
  ];

  const createdPerms = [];

  for (const p of permissionsData) {
    const perm = await (prisma as any).permission.upsert({
      where: {
        action_subject: { action: p.action, subject: p.subject },
      },
      update: {},
      create: p,
    });
    createdPerms.push(perm);
  }

  console.log(`Created/verified ${createdPerms.length} permissions.`);

  // Student read permissions (subjects students should be able to read)
  const studentReadSubjects = [
    'Attendance', 'AttendanceSession', 'Timetable', 'Course', 'Notice',
    'FeeRecord', 'MarketplaceListing', 'HostelIssue', 'CanteenItem',
    'Room', 'FeatureFlag', 'Examination', 'Enrollment', 'Department',
    'CgpaEntry', 'CampusMap',
  ];
  // Student write permissions
  const studentWritePerms = [
    { action: 'create', subject: 'Attendance' },
    { action: 'create', subject: 'MarketplaceListing' },
    { action: 'update', subject: 'MarketplaceListing' },
    { action: 'delete', subject: 'MarketplaceListing' },
    { action: 'create', subject: 'HostelIssue' },
    { action: 'update', subject: 'HostelIssue' },
    { action: 'create', subject: 'Enrollment' },
    { action: 'update', subject: 'Enrollment' },
    { action: 'delete', subject: 'Enrollment' },
    { action: 'create', subject: 'CgpaEntry' },
    { action: 'update', subject: 'CgpaEntry' },
    { action: 'delete', subject: 'CgpaEntry' },
    { action: 'create', subject: 'CanteenItem' },
  ];

  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  if (studentRole) {
    // Grant all read perms
    for (const subject of studentReadSubjects) {
      const perm = createdPerms.find(p => p.action === 'read' && p.subject === subject);
      if (perm) {
        await (prisma as any).rolePermission.upsert({
          where: { roleId_permissionId: { roleId: studentRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: studentRole.id, permissionId: perm.id },
        });
      }
    }
    // Grant write perms
    for (const wp of studentWritePerms) {
      const perm = createdPerms.find(p => p.action === wp.action && p.subject === wp.subject);
      if (perm) {
        await (prisma as any).rolePermission.upsert({
          where: { roleId_permissionId: { roleId: studentRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: studentRole.id, permissionId: perm.id },
        });
      }
    }
    console.log('Granted student role permissions.');
  } else {
    console.log('WARNING: student role not found!');
  }

  // Admin/SuperAdmin/CollegeAdmin gets ALL permissions
  const adminRoles = await prisma.role.findMany({
    where: { name: { in: ['admin', 'superadmin', 'faculty', 'college_admin'] } },
  });
  for (const role of adminRoles) {
    for (const perm of createdPerms) {
      await (prisma as any).rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
    console.log(`Granted ${role.name} role all ${createdPerms.length} permissions.`);
  }
}

if (require.main === module) {
  seedPermissions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
