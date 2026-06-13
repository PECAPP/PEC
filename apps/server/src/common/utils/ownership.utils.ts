import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function assertCourseOwnership(
  userId: string,
  courseId: string,
  prisma: PrismaService,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { facultyId: true },
  });

  if (!course) {
    throw new ForbiddenException('Course not found');
  }

  // If facultyId is not set, or it doesn't match the user, deny access.
  if (course.facultyId !== userId) {
    throw new ForbiddenException('You do not have permission to manage this course');
  }
}

export async function assertCourseOwnershipByCode(
  userId: string,
  courseCode: string,
  prisma: PrismaService,
) {
  const course = await prisma.course.findUnique({
    where: { code: courseCode },
    select: { facultyId: true },
  });

  if (!course) {
    throw new ForbiddenException('Course not found');
  }

  if (course.facultyId !== userId) {
    throw new ForbiddenException('You do not have permission to manage this course');
  }
}

export async function filterByFacultyScope(
  userId: string,
  prisma: PrismaService,
) {
  const courses = await prisma.course.findMany({
    where: { facultyId: userId },
    select: { id: true },
  });
  return courses.map(c => c.id);
}
