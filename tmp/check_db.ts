import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.academicCalendarEvent.count();
  console.log(`Total AcademicCalendarEvents: ${count}`);
  
  if (count > 0) {
    const firstEvent = await prisma.academicCalendarEvent.findFirst();
    console.log('Sample Event:', JSON.stringify(firstEvent, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
