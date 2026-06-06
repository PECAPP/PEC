import { prisma } from './utils';
import { DEPARTMENTS } from './data';

export async function seedDepartments() {
  const prismaAny = prisma as any;
  for (const department of DEPARTMENTS) {
    await prismaAny.department.create({
      data: {
        code: department.code,
        name: department.name,
        description: department.description,
        status: 'active',
        timetableLabel: department.timetableLabel,
      },
    });
  }
}
