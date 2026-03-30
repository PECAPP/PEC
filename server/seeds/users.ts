import { prisma, daysAgo } from './utils';
import * as bcrypt from 'bcrypt';

export async function ensureRole(name: string) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

export async function createUserWithRole(params: {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  isPublicProfile?: boolean;
}) {
  const role = await ensureRole(params.role);

  return prisma.user.create({
    data: {
      email: params.email,
      name: params.name,
      password: params.passwordHash,
      role: params.role,
      githubUsername: params.githubUsername ?? null,
      linkedinUsername: params.linkedinUsername ?? null,
      isPublicProfile: params.isPublicProfile ?? true,
      profileComplete: true,
      emailVerified: true,
      emailVerifiedAt: daysAgo(90),
      passwordChangedAt: daysAgo(30),
      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
  });
}

export async function seedCoreUsers(passwordHash: string) {
  const admin = await createUserWithRole({
    email: 'admin@pec.edu',
    name: 'PEC College Admin',
    role: 'college_admin',
    passwordHash,
  });

  await createUserWithRole({
    email: 'ops.admin@pec.edu',
    name: 'Operations Admin',
    role: 'admin',
    passwordHash,
  });

  await createUserWithRole({
    email: 'moderator@pec.edu',
    name: 'Platform Moderator',
    role: 'moderator',
    passwordHash,
  });

  await createUserWithRole({
    email: 'guest.user@pec.edu',
    name: 'Generic Campus User',
    role: 'user',
    passwordHash,
  });

  return admin;
}
