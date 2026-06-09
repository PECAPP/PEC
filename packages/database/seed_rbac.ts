import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RBAC permissions...');
  
  // 1. Create Core Roles
  const roles = [
    { name: 'student', description: 'Standard student account', hierarchy: 1 },
    { name: 'faculty', description: 'Teaching staff', hierarchy: 2 },
    { name: 'admin', description: 'System Administrator', hierarchy: 3 },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { hierarchy: r.hierarchy, description: r.description, isSystem: true },
      create: { ...r, isSystem: true },
    });
  }

  // 2. Create Base Permissions
  const permissions = [
    // Auth & Identity
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'User', conditions: { id: '{{id}}' } },
    { action: 'manage', subject: 'User' },
    
    // Hostel
    { action: 'read', subject: 'HostelIssue' },
    { action: 'create', subject: 'HostelIssue' },
    { action: 'update', subject: 'HostelIssue', conditions: { studentId: '{{id}}' } },
    { action: 'delete', subject: 'HostelIssue', conditions: { studentId: '{{id}}' } },
    { action: 'manage', subject: 'HostelIssue' },
    
    // Marketplace
    { action: 'read', subject: 'MarketplaceListing' },
    { action: 'create', subject: 'MarketplaceListing' },
    { action: 'update', subject: 'MarketplaceListing', conditions: { sellerId: '{{id}}' } },
    { action: 'delete', subject: 'MarketplaceListing', conditions: { sellerId: '{{id}}' } },
    { action: 'manage', subject: 'MarketplaceListing' },
    
    // Finance
    { action: 'read', subject: 'FeeRecord', conditions: { studentId: '{{id}}' } },
    { action: 'manage', subject: 'FeeRecord' },
    
    // Timetable
    { action: 'read', subject: 'Timetable' },
    { action: 'manage', subject: 'Timetable' },
    
    // Courses
    { action: 'read', subject: 'Course' },
    { action: 'manage', subject: 'Course' },
    
    // CourseMaterial
    { action: 'read', subject: 'CourseMaterial' },
    { action: 'create', subject: 'CourseMaterial' },
    { action: 'update', subject: 'CourseMaterial', conditions: { uploadedBy: '{{id}}' } },
    { action: 'delete', subject: 'CourseMaterial', conditions: { uploadedBy: '{{id}}' } },
    { action: 'manage', subject: 'CourseMaterial' },
    
    // Admin / System
    { action: 'manage', subject: 'Role' },
    { action: 'manage', subject: 'Permission' },
    { action: 'manage', subject: 'all' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { action_subject: { action: p.action, subject: p.subject } },
      update: { conditions: p.conditions || null },
      create: { 
        action: p.action, 
        subject: p.subject, 
        conditions: p.conditions || null,
        description: `Allows ${p.action} on ${p.subject}`
      },
    });
  }

  // 3. Map Basic Permissions to Roles
  console.log('Mapping permissions to roles...');
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  const facultyRole = await prisma.role.findUnique({ where: { name: 'faculty' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  const getPerms = async (actions: string[], subjects: string[]) => {
    return prisma.permission.findMany({
      where: { action: { in: actions }, subject: { in: subjects } }
    });
  };

  if (studentRole) {
    const studentPerms = await getPerms(
      ['read', 'create', 'update', 'delete'], 
      ['User', 'HostelIssue', 'MarketplaceListing', 'FeeRecord', 'Timetable', 'Course', 'CourseMaterial']
    );
    // filter down to non-manage 
    const filtered = studentPerms.filter(p => p.action !== 'manage');
    
    for (const p of filtered) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: studentRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: studentRole.id, permissionId: p.id }
      });
    }
  }

  if (facultyRole) {
    const facultyPerms = await getPerms(
      ['read', 'update', 'create', 'delete'], 
      ['User', 'Timetable', 'Course', 'CourseMaterial']
    );
    for (const p of facultyPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: facultyRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: facultyRole.id, permissionId: p.id }
      });
    }
  }

  if (adminRole) {
    const adminPerms = await prisma.permission.findMany();
    for (const p of adminPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id }
      });
    }
  }

  console.log('RBAC Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
