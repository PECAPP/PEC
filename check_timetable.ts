import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.timetable.count();
  console.log(`Total Timetable rows: ${count}`);

  const rows = await prisma.timetable.findMany({
    take: 5
  });
  console.log('Sample rows:', rows);

  const deptGroups = await prisma.timetable.groupBy({
    by: ['department'],
    _count: {
      _all: true
    }
  });
  console.log('Department groups in Timetable:', deptGroups);
}

main().catch(console.error).finally(() => prisma.$disconnect());
