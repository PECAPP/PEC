import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultyBioService {
  constructor(private readonly prisma: PrismaService) {}

  async getFacultyBio(facultyId: string) {
    const profile = await this.prisma.facultyProfile.findUnique({
      where: { userId: facultyId },
      include: { user: true },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.user.name,
      email: profile.user.email,
      avatar: profile.user.avatar,
      employeeId: profile.employeeId,
      department: profile.department,
      designation: profile.designation,
      phone: profile.phone,
      specialization: profile.specialization,
      qualifications: profile.qualifications,
      bio: profile.bio,
      githubUsername: profile.user.githubUsername,
      linkedinUsername: profile.user.linkedinUsername,
    };
  }

  async updateFacultyBio(facultyId: string, data: {
    bio?: string;
    specialization?: string;
    qualifications?: string;
    phone?: string;
  }) {
    return this.prisma.facultyProfile.update({
      where: { userId: facultyId },
      data,
    });
  }

  async getAllFaculty(department?: string) {
    const where: any = {};
    if (department) where.department = department;

    const profiles = await this.prisma.facultyProfile.findMany({
      where,
      include: { user: true },
      orderBy: { user: { name: 'asc' } },
    });

    return profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      avatar: p.user.avatar,
      employeeId: p.employeeId,
      department: p.department,
      designation: p.designation,
      specialization: p.specialization,
      bio: p.bio,
    }));
  }
}
