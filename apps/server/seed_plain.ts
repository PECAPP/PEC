import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding (plain) database...');

  const roles = ['student', 'faculty', 'admin'];
  for (const name of roles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pec.edu' },
    update: { password: hashedPassword, role: 'admin' },
    create: {
      email: 'admin@pec.edu',
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
    },
  });

  console.log('Admin user seeded:', admin.email);

  console.log('Plain seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
