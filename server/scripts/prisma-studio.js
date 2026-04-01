const { PrismaStudio } = require('@prisma/studio-p DEFAULT');

async function main() {
  const studio = new PrismaStudio({
    schema: './prisma/schema.prisma',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pec',
  });
  
  await studio.run();
}

main().catch(console.error);
