import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding basic permissions...');
  const permissionsData = [
    { action: 'read', subject: 'Course', description: 'View courses' },
    { action: 'read', subject: 'Timetable', description: 'View schedule' },
    { action: 'read', subject: 'FeeRecord', description: 'View fees' },
    { action: 'read', subject: 'MarketplaceListing', description: 'View marketplace' },
    { action: 'read', subject: 'HostelIssue', description: 'View hostel issues' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { action_subject: { action: p.action, subject: p.subject } },
      update: {},
      create: p,
    });
  }

  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  if (studentRole) {
    const allPerms = await prisma.permission.findMany();
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: studentRole.id,
            permissionId: p.id,
          }
        },
        update: {},
        create: {
          roleId: studentRole.id,
          permissionId: p.id,
        }
      });
    }
    console.log('Granted all basic read permissions to student role.');
  } else {
    console.log('Student role not found!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
