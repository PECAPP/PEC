import { PrismaClient } from '@pec/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/pec";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create standard roles
  const roles = ['STUDENT', 'FACULTY', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Roles seeded.');

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pec.edu' },
    update: {},
    create: {
      email: 'admin@pec.edu',
      password: hashedPassword,
      name: 'System Admin',
      roles: {
        create: {
          role: { connect: { id: adminRole!.id } },
        },
      },
    },
  });

  console.log('Admin user seeded:', admin.email);

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'student@pec.edu' },
    update: {},
    create: {
      email: 'student@pec.edu',
      password: hashedPassword,
      name: 'Test Student',
      roles: {
        create: {
          role: { connect: { id: studentRole!.id } },
        },
      },
      studentProfile: {
        create: {
          enrollmentNumber: '12345678',
          department: 'CSE',
          semester: 1,
        }
      }
    },
  });

  console.log('Student user seeded:', student.email);

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
