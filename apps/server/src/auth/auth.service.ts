import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { APP_ROLES } from './roles';
import {
  decryptField,
  encryptField,
} from '../common/security/field-encryption';
import { createHash, randomBytes } from 'crypto';

type AuthContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AuthResult = {
  access_token: string;
  refresh_token: string;
  refresh_expires_at: string;
  user: {
    uid: string;
    email: string;
    fullName: string;
    role: string | null;
    roles: string[];
    avatar: string | null;
    verified: boolean;
    profileComplete: boolean;
  };
};

type UserWithRelations = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  avatar: string | null;
  profileComplete: boolean;
  emailVerified: boolean;
  sessionVersion: number;
  passwordChangedAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  roles: Array<{ role: { name: string } }>;
};

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn = this.resolveAccessTokenExpiry(
    process.env.ACCESS_TOKEN_TTL,
  );
  private readonly refreshTokenTtlDays = Number(
    process.env.REFRESH_TOKEN_TTL_DAYS ?? '7',
  );
  private readonly accountLockThreshold = Number(
    process.env.AUTH_LOCK_THRESHOLD ?? '5',
  );
  private readonly accountLockMinutes = Number(
    process.env.AUTH_LOCK_MINUTES ?? '15',
  );

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(
    email: string,
    pass: string,
    context: AuthContext,
  ): Promise<AuthResult> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    this.ensureNotLocked(user);

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.registerFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException();
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    return this.issueTokensForUser(user.id, context);
  }

  async signUp(
    email: string,
    pass: string,
    name: string,
    role: string,
    context: AuthContext,
  ): Promise<AuthResult & { emailVerificationToken: string }> {
    if (!APP_ROLES.includes(role as (typeof APP_ROLES)[number])) {
      throw new BadRequestException('Unsupported role');
    }

    const existing = await this.usersService.findOne(email);
    if (existing) throw new ConflictException('User already exists');

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(pass, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          password: hash,
          name,
          role,
          passwordChangedAt: new Date(),
        },
      });

      const persistedRole = await tx.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role },
      });

      await tx.userRole.create({
        data: {
          userId: created.id,
          roleId: persistedRole.id,
        },
      });

      return created;
    });

    const auth = await this.issueTokensForUser(user.id, context);
    const verification = await this.createEmailVerificationToken(user.id);

    return {
      ...auth,
      emailVerificationToken: verification,
    };
  }

  async refreshSession(
    refreshTokenRaw: string,
    context: AuthContext,
  ): Promise<AuthResult> {
    const tokenHash = this.hashToken(refreshTokenRaw);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: {
          familyId: tokenRecord.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (tokenRecord.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const replacementRaw = this.generateOpaqueToken();
    const replacementHash = this.hashToken(replacementRaw);
    const expiresAt = this.getRefreshExpiryDate();

    const [replacement] = await this.prisma.$transaction([
      this.prisma.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: replacementHash,
          familyId: tokenRecord.familyId,
          expiresAt,
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
        },
      }),
      this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        replacedByTokenId: replacement.id,
      },
    });

    const accessToken = await this.createAccessToken(tokenRecord.user);
    const roles = this.extractRoles(tokenRecord.user);

    return {
      access_token: accessToken,
      refresh_token: replacementRaw,
      refresh_expires_at: expiresAt.toISOString(),
      user: {
        uid: tokenRecord.user.id,
        email: tokenRecord.user.email,
        fullName: tokenRecord.user.name,
        role: tokenRecord.user.role,
        roles,
        avatar: tokenRecord.user.avatar,
        verified: tokenRecord.user.emailVerified,
        profileComplete: tokenRecord.user.profileComplete,
      },
    };
  }

  async logout(refreshTokenRaw?: string): Promise<void> {
    if (!refreshTokenRaw) {
      return;
    }

    const tokenHash = this.hashToken(refreshTokenRaw);
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
    ]);

    return { verified: true };
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ accepted: boolean; resetToken?: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return { accepted: true };
    }

    const resetToken = this.generateOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(resetToken),
        expiresAt: new Date(Date.now() + 30 * 60_000),
      },
    });

    return {
      accepted: true,
      resetToken,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ reset: boolean }> {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: {
          password: hashed,
          passwordChangedAt: new Date(),
          sessionVersion: { increment: 1 },
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId: record.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return { reset: true };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ changed: boolean }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const currentValid = await bcrypt.compare(currentPassword, user.password);
    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashed,
          passwordChangedAt: new Date(),
          sessionVersion: { increment: 1 },
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return { changed: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const studentProfile = user.studentProfile;
    const facultyProfile = user.facultyProfile;

    return {
      id: user.id,
      uid: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      fullName: user.name,
      role: user.role,
      githubUsername: user.githubUsername,
      linkedinUsername: user.linkedinUsername,
      isPublic: user.isPublicProfile,
      roles: user.roles.map((entry) => entry.role.name),
      avatar: user.avatar,
      verified: user.emailVerified,
      profileComplete: user.profileComplete,
      ...(studentProfile
        ? {
            enrollmentNumber: studentProfile.enrollmentNumber,
            department: studentProfile.department,
            semester: studentProfile.semester,
            phone: decryptField(studentProfile.phone),
            dob: studentProfile.dob,
            address: decryptField(studentProfile.address),
            bio: decryptField(studentProfile.bio),
          }
        : {}),
      ...(facultyProfile
        ? {
            employeeId: facultyProfile.employeeId,
            department: facultyProfile.department,
            designation: facultyProfile.designation,
            phone: decryptField(facultyProfile.phone),
            specialization: facultyProfile.specialization,
            qualifications: facultyProfile.qualifications,
            bio: decryptField(facultyProfile.bio),
          }
        : {}),
    };
  }

  async completeProfile(userId: string, profileData: Record<string, any>) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const role = profileData.role || user.role;

    if (!role || !APP_ROLES.includes(role as (typeof APP_ROLES)[number])) {
      throw new BadRequestException('Unsupported role');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (role === 'student') {
        await tx.studentProfile.upsert({
          where: { userId },
          create: {
            userId,
            enrollmentNumber: profileData.enrollmentNumber,
            department: profileData.department,
            semester: Number(profileData.semester),
            phone: encryptField(profileData.phone || null),
            dob: profileData.dob ? new Date(profileData.dob) : null,
            address: encryptField(profileData.address || null),
            bio: encryptField(profileData.bio || null),
          },
          update: {
            enrollmentNumber: profileData.enrollmentNumber,
            department: profileData.department,
            semester: Number(profileData.semester),
            phone: encryptField(profileData.phone || null),
            dob: profileData.dob ? new Date(profileData.dob) : null,
            address: encryptField(profileData.address || null),
            bio: encryptField(profileData.bio || null),
          },
        });
      }

      if (role === 'faculty') {
        await tx.facultyProfile.upsert({
          where: { userId },
          create: {
            userId,
            employeeId: profileData.employeeId,
            department: profileData.department,
            designation: profileData.designation,
            phone: encryptField(profileData.phone || null),
            specialization: profileData.specialization || null,
            qualifications: profileData.qualifications || null,
            bio: encryptField(profileData.bio || null),
          },
          update: {
            employeeId: profileData.employeeId,
            department: profileData.department,
            designation: profileData.designation,
            phone: encryptField(profileData.phone || null),
            specialization: profileData.specialization || null,
            qualifications: profileData.qualifications || null,
            bio: encryptField(profileData.bio || null),
          },
        });
      }

      return tx.user.update({
        where: { id: userId },
        data: {
          role,
          profileComplete: true,
          name: profileData.fullName || user.name,
          githubUsername:
            profileData.githubUsername !== undefined
              ? profileData.githubUsername || null
              : user.githubUsername,
          linkedinUsername:
            profileData.linkedinUsername !== undefined
              ? profileData.linkedinUsername || null
              : user.linkedinUsername,
          isPublicProfile:
            profileData.isPublic !== undefined
              ? Boolean(profileData.isPublic)
              : user.isPublicProfile,
        },
      });
    });

    return {
      id: updated.id,
      uid: updated.id,
      sub: updated.id,
      email: updated.email,
      name: updated.name,
      fullName: updated.name,
      role: updated.role,
      githubUsername: updated.githubUsername,
      linkedinUsername: updated.linkedinUsername,
      isPublic: updated.isPublicProfile,
      avatar: updated.avatar,
      verified: updated.emailVerified,
      profileComplete: updated.profileComplete,
    };
  }

  async setRole(userId: string, role: string) {
    if (!APP_ROLES.includes(role as (typeof APP_ROLES)[number])) {
      throw new BadRequestException('Unsupported role');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const roleRecord = await tx.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role },
      });

      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.create({
        data: {
          userId,
          roleId: roleRecord.id,
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: {
          role,
          profileComplete: false,
        },
      });
    });

    return {
      id: updated.id,
      uid: updated.id,
      sub: updated.id,
      email: updated.email,
      name: updated.name,
      fullName: updated.name,
      role: updated.role,
      avatar: updated.avatar,
      verified: false,
      profileComplete: updated.profileComplete,
    };
  }

  private async issueTokensForUser(
    userId: string,
    context: AuthContext,
  ): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const refreshTokenRaw = this.generateOpaqueToken();
    const refreshTokenHash = this.hashToken(refreshTokenRaw);
    const refreshExpiresAt = this.getRefreshExpiryDate();
    const familyId = randomBytes(16).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: refreshExpiresAt,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
    });

    const accessToken = await this.createAccessToken(user);
    const roles = this.extractRoles(user);

    return {
      access_token: accessToken,
      refresh_token: refreshTokenRaw,
      refresh_expires_at: refreshExpiresAt.toISOString(),
      user: {
        uid: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        roles,
        avatar: user.avatar,
        verified: user.emailVerified,
        profileComplete: user.profileComplete,
      },
    };
  }

  private extractRoles(user: UserWithRelations): string[] {
    if (!user) {
      return [];
    }

    if ('roles' in user && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles.map((entry) => entry.role.name);
    }

    return user.role ? [user.role] : [];
  }

  private async createAccessToken(
    user: NonNullable<UserWithRelations>,
  ): Promise<string> {
    const roles = this.extractRoles(user);
    const primaryRole = user.role ?? roles[0] ?? null;
    const payload = {
      sub: user.id,
      email: user.email,
      role: primaryRole,
      sv: user.sessionVersion,
      pwd: user.passwordChangedAt?.getTime() ?? 0,
    } as Record<string, any>;

    if (roles.length > 0) {
      payload.roles = roles;
    }

    return this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiresIn as any,
    });
  }

  private resolveAccessTokenExpiry(rawValue?: string): string | number {
    if (!rawValue || rawValue.trim().length === 0) {
      return '15m';
    }

    const trimmed = rawValue.trim();
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    return trimmed;
  }

  private ensureNotLocked(user: NonNullable<UserWithRelations>): void {
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException('Account locked. Please try again later.');
    }
  }

  private async registerFailedLogin(
    userId: string,
    currentAttempts: number,
  ): Promise<void> {
    const attempts = currentAttempts + 1;
    const lockUntil =
      attempts >= this.accountLockThreshold
        ? new Date(Date.now() + this.accountLockMinutes * 60_000)
        : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: lockUntil,
      },
    });
  }

  private async createEmailVerificationToken(userId: string): Promise<string> {
    const raw = this.generateOpaqueToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      },
    });

    return raw;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateOpaqueToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private getRefreshExpiryDate(): Date {
    return new Date(Date.now() + this.refreshTokenTtlDays * 24 * 60 * 60_000);
  }
}
