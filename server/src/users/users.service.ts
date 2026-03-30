import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  decryptField,
  encryptField,
} from '../common/security/field-encryption';

type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: { role: true };
    };
    studentProfile: true;
    facultyProfile: true;
  };
}>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdminUser(data: {
    fullName: string;
    email: string;
    role: string;
    status?: string;
    department?: string;
    enrollmentNumber?: string;
    semester?: number;
    dateOfBirth?: string;
    employeeId?: string;
    designation?: string;
    specialization?: string;
    phone?: string;
  }) {
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD ?? 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          role: data.role,
          password: passwordHash,
          passwordChangedAt: new Date(),
          profileComplete: true,
          lockedUntil:
            data.status === 'suspended'
              ? new Date('2099-01-01T00:00:00.000Z')
              : null,
        },
      });

      const roleRecord = await tx.role.upsert({
        where: { name: data.role },
        update: {},
        create: { name: data.role },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      return user;
    });

    if (data.role === 'student' && data.department && data.enrollmentNumber) {
      await this.upsertStudentProfile(created.id, {
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        semester: data.semester ?? 1,
        phone: data.phone || null,
        dob: data.dateOfBirth || null,
      });
    }

    if (data.role === 'faculty' && data.department) {
      await this.upsertFacultyProfile(created.id, {
        employeeId: data.employeeId || `FAC-${Date.now()}`,
        department: data.department,
        designation: data.designation || 'Faculty',
        specialization: data.specialization || null,
        phone: data.phone || null,
      });
    }

    const withProfiles = await this.findById(created.id);
    return withProfiles ? this.toPublicUserRecord(withProfiles) : null;
  }

  async updateAdminUser(
    id: string,
    data: {
      fullName?: string;
      email?: string;
      role?: string;
      status?: string;
      department?: string;
      enrollmentNumber?: string;
      semester?: number;
      dateOfBirth?: string;
      employeeId?: string;
      designation?: string;
      specialization?: string;
      phone?: string;
    },
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          ...(data.fullName ? { name: data.fullName } : {}),
          ...(data.email ? { email: data.email } : {}),
          ...(data.role ? { role: data.role } : {}),
          ...(data.status
            ? {
                lockedUntil:
                  data.status === 'suspended'
                    ? new Date('2099-01-01T00:00:00.000Z')
                    : null,
              }
            : {}),
        },
      });

      if (data.role) {
        const roleRecord = await tx.role.upsert({
          where: { name: data.role },
          update: {},
          create: { name: data.role },
        });

        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({
          data: {
            userId: id,
            roleId: roleRecord.id,
          },
        });
      }
    });

    if (data.role === 'student' && data.department && data.enrollmentNumber) {
      await this.upsertStudentProfile(id, {
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        semester: data.semester ?? 1,
        phone: data.phone || null,
        dob: data.dateOfBirth || null,
      });
    }

    if (data.role === 'faculty' && data.department) {
      await this.upsertFacultyProfile(id, {
        employeeId: data.employeeId || `FAC-${Date.now()}`,
        department: data.department,
        designation: data.designation || 'Faculty',
        specialization: data.specialization || null,
        phone: data.phone || null,
      });
    }

    const withProfiles = await this.findById(id);
    return withProfiles ? this.toPublicUserRecord(withProfiles) : null;
  }

  async deleteAdminUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async findOne(email: string): Promise<UserWithProfiles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
        studentProfile: true,
        facultyProfile: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<UserWithProfiles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
        studentProfile: true,
        facultyProfile: true,
      },
    });
  }

  async findMany(params?: {
    role?: string;
    department?: string;
    semester?: number;
    limit?: number;
    offset?: number;
    requesterId?: string;
    requesterRole?: string;
  }): Promise<{ items: Array<Record<string, any>>; total: number }> {
    let scopedDepartment = params?.department;

    if (params?.requesterRole === 'faculty' && params?.requesterId) {
      const requester = await this.findById(params.requesterId);
      const requesterDepartment =
        requester?.facultyProfile?.department ??
        requester?.studentProfile?.department ??
        null;

      if (!requesterDepartment) {
        return { items: [], total: 0 };
      }

      scopedDepartment = requesterDepartment;
    }

    const where: Prisma.UserWhereInput = {
      ...(params?.role ? { role: params.role } : {}),
      ...(scopedDepartment || params?.semester
        ? {
            OR: [
              {
                studentProfile: {
                  is: {
                    ...(scopedDepartment
                      ? { department: scopedDepartment }
                      : {}),
                    ...(params?.semester ? { semester: params.semester } : {}),
                  },
                },
              },
              {
                facultyProfile: {
                  is: {
                    ...(scopedDepartment
                      ? { department: scopedDepartment }
                      : {}),
                  },
                },
              },
            ],
          }
        : {}),
    };

    const limit = Math.min(Math.max(params?.limit ?? 100, 1), 500);
    const offset = Math.max(params?.offset ?? 0, 0);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { email: 'asc' },
        include: {
          roles: {
            include: { role: true },
          },
          studentProfile: true,
          facultyProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toPublicUserRecord(item)),
      total,
    };
  }

  async updateById(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async upsertStudentProfile(userId: string, data: Record<string, any>) {
    return this.prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        semester: Number(data.semester),
        phone: encryptField(data.phone || null),
        dob: data.dob ? new Date(data.dob) : null,
        address: encryptField(data.address || null),
        bio: encryptField(data.bio || null),
      },
      update: {
        enrollmentNumber: data.enrollmentNumber,
        department: data.department,
        semester: Number(data.semester),
        phone: encryptField(data.phone || null),
        dob: data.dob ? new Date(data.dob) : null,
        address: encryptField(data.address || null),
        bio: encryptField(data.bio || null),
      },
    });
  }

  async upsertFacultyProfile(userId: string, data: Record<string, any>) {
    return this.prisma.facultyProfile.upsert({
      where: { userId },
      create: {
        userId,
        employeeId: data.employeeId,
        department: data.department,
        designation: data.designation,
        phone: encryptField(data.phone || null),
        specialization: data.specialization || null,
        qualifications: data.qualifications || null,
        bio: encryptField(data.bio || null),
      },
      update: {
        employeeId: data.employeeId,
        department: data.department,
        designation: data.designation,
        phone: encryptField(data.phone || null),
        specialization: data.specialization || null,
        qualifications: data.qualifications || null,
        bio: encryptField(data.bio || null),
      },
    });
  }

  toPublicUserRecord(user: UserWithProfiles): Record<string, any> {
    const studentProfile = user.studentProfile;
    const facultyProfile = user.facultyProfile;

    return {
      id: user.id,
      uid: user.id,
      email: user.email,
      name: user.name,
      fullName: user.name,
      role: user.role,
      roles: user.roles.map((entry) => entry.role.name),
      avatar: user.avatar,
      profileComplete: user.profileComplete,
      emailVerified: user.emailVerified,
      department:
        studentProfile?.department ?? facultyProfile?.department ?? null,
      semester: studentProfile?.semester ?? null,
      enrollmentNumber: studentProfile?.enrollmentNumber ?? null,
      employeeId: facultyProfile?.employeeId ?? null,
      designation: facultyProfile?.designation ?? null,
      specialization: facultyProfile?.specialization ?? null,
      status:
        user.lockedUntil && user.lockedUntil.getTime() > Date.now()
          ? 'suspended'
          : 'active',
      phone:
        decryptField(studentProfile?.phone) ??
        decryptField(facultyProfile?.phone),
    };
  }
}

