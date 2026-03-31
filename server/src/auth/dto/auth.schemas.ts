import { z } from 'zod';

const appRoles = [
  'student',
  'faculty',
  'college_admin',
  'admin',
  'moderator',
  'user',
] as const;

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const signUpSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/\d/, 'Password must include at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must include at least one special character',
    ),
  name: z.string().trim().min(2).max(120),
  role: z.enum(appRoles).optional(),
});

export const setRoleSchema = z.object({
  role: z.enum(appRoles),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/\d/, 'Password must include at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must include at least one special character',
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/\d/, 'Password must include at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must include at least one special character',
    ),
});

import { ApiProperty } from '@nestjs/swagger';

export class SignInInput {
  @ApiProperty({ description: 'The registered email address', format: 'email', example: 'student@pec.edu' })
  email: string;

  @ApiProperty({ description: 'The password associated with the account', minLength: 8, example: 'P@ssw0rd123' })
  password: string;
}

export class SignUpInput {
  @ApiProperty({ description: 'The registered email address', format: 'email' })
  email: string;

  @ApiProperty({ description: 'A strong password', minLength: 8 })
  password: string;

  @ApiProperty({ description: 'Full Display Name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User role', enum: appRoles, default: 'student', required: false })
  role?: (typeof appRoles)[number];
}

export class SetRoleInput {
  @ApiProperty({ description: 'Role to assign', enum: appRoles })
  role: (typeof appRoles)[number];
}

export class RefreshInput {
  @ApiProperty({ description: 'Refresh token string', required: false })
  refreshToken?: string;
}

export class VerifyEmailInput {
  @ApiProperty({ description: 'Email verification token' })
  token: string;
}

export class RequestPasswordResetInput {
  @ApiProperty({ description: 'Email address to send reset link' })
  email: string;
}

export class ResetPasswordInput {
  @ApiProperty({ description: 'Password reset token' })
  token: string;

  @ApiProperty({ description: 'New password', minLength: 8 })
  password: string;
}

export class ChangePasswordInput {
  @ApiProperty({ description: 'Current valid password' })
  currentPassword: string;

  @ApiProperty({ description: 'New strong password', minLength: 8 })
  newPassword: string;
}

