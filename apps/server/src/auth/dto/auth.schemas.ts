import { z } from 'zod';

const appRoles = [
  'student',
  'faculty',
  'admin',
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

import { createZodDto } from 'nestjs-zod';

export class SignInInput extends createZodDto(signInSchema) {}
export class SignUpInput extends createZodDto(signUpSchema) {}
export class SetRoleInput extends createZodDto(setRoleSchema) {}
export class RefreshInput extends createZodDto(refreshSchema) {}
export class VerifyEmailInput extends createZodDto(verifyEmailSchema) {}
export class RequestPasswordResetInput extends createZodDto(requestPasswordResetSchema) {}
export class ResetPasswordInput extends createZodDto(resetPasswordSchema) {}
export class ChangePasswordInput extends createZodDto(changePasswordSchema) {}

