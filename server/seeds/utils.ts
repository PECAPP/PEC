import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export function sample<T>(items: T[], index: number): T {
  return items[index % items.length];
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

export function batchForSemester(semester: number) {
  const currentYear = new Date().getFullYear();
  switch (semester) {
    case 1:
    case 2:
      return `${currentYear}-${currentYear + 4}`;
    case 3:
    case 4:
      return `${currentYear - 1}-${currentYear + 3}`;
    case 5:
    case 6:
      return `${currentYear - 2}-${currentYear + 2}`;
    case 7:
    case 8:
      return `${currentYear - 3}-${currentYear + 1}`;
    default:
      return `${currentYear}-${currentYear + 4}`;
  }
}

export async function clearDatabase() {
  if (process.env.SKIP_WIPE === 'true') {
     console.log('Skipping database wipe (SKIP_WIPE=true)');
     return;
  }

  const prismaAny = prisma as any;
  try {
    await prisma.auditLog.deleteMany();
    await prismaAny.backgroundJob.deleteMany();
    await prismaAny.featureFlag.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.message.deleteMany();
    await prismaAny.notice.deleteMany();
    await prisma.clubJoinRequest.deleteMany();
    await prisma.club.deleteMany();
    await prisma.userChatRoom.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.timetable.deleteMany();
    await prisma.course.deleteMany();
    await prisma.job.deleteMany();
    await prisma.room.deleteMany();
    await prismaAny.department.deleteMany();
    await (prisma as any).feeRecord.deleteMany();
    await prisma.facultyProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await (prisma as any).hostelIssue.deleteMany();
    await (prisma as any).canteenOrderItem.deleteMany();
    await (prisma as any).canteenOrder.deleteMany();
    await (prisma as any).canteenItem.deleteMany();
    await prisma.user.deleteMany();
    console.log('Database wipe completed.');
  } catch (error) {
    console.warn('Wipe encountered issues, likely tables already empty or missing:', (error as any).message);
  }
}

export function encryptField(value: string) {
  // Mock encryption for seeding as used in original script
  return value;
}
