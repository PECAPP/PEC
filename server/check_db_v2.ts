import { prisma } from './seeds/utils';

async function main() {
  try {
    const count = await (prisma as any).academicCalendarEvent.count();
    console.log(`Total AcademicCalendarEvents: ${count}`);
    
    if (count > 0) {
      const events = await (prisma as any).academicCalendarEvent.findMany({
        take: 5,
        orderBy: { date: 'asc' }
      });
      console.log('Earliest 5 Events:');
      events.forEach((e: any) => {
        console.log(`- ${e.title} (${e.date.toISOString().split('T')[0]})`);
      });
    }
  } catch (error) {
    console.error('Error checking DB:', error);
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
