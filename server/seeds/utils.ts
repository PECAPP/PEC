import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

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
  switch (semester) {
    case 1: return '2026-2030';
    case 3: return '2025-2029';
    case 5: return '2024-2028';
  }
}

export async function clearDatabase() {
  const prismaAny = prisma as any;
  await prisma.auditLog.deleteMany();
  await prismaAny.backgroundJob.deleteMany();
  await prismaAny.featureFlag.deleteMany();
  await prisma.bookBorrow.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.message.deleteMany();
  await prisma.userChatRoom.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.course.deleteMany();
  await prisma.job.deleteMany();
  await prisma.book.deleteMany();
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
  await prisma.user.deleteMany();
}

export function encryptField(value: string) {
  // Mock encryption for seeding as used in original script
  return value;
}
