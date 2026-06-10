'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { facultySchema } from '@pec/shared';
import { logActivity } from '@/lib/logger';
import { z } from 'zod';
import { apiFetch } from '@/lib/api-fetch';

// 1. Create Faculty Action
export const createFacultyAction = actionClient
  .schema(facultySchema)
  .action(async ({ parsedInput }) => {
    const body = { ...(parsedInput as object), role: 'faculty' };
    const { ok } = await apiFetch('POST', 'users', body);
    
    if (!ok) {
      throw new Error('Failed to create faculty member via gateway API.');
    }

    revalidateTag('faculty', 'default' as any);
    logActivity('create', 'faculty', { name: parsedInput.fullName, email: parsedInput.email });
    return { success: true };
  });

// 2. Update Faculty Action
export const updateFacultyAction = actionClient
  .schema(facultySchema.partial())
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Faculty ID is required for updates.');
    
    const { ok } = await apiFetch('PATCH', `users/${parsedInput.id}`, parsedInput);
    if (!ok) {
      throw new Error('Failed to update faculty member.');
    }

    revalidateTag('faculty', 'default' as any);
    logActivity('update', 'faculty', { id: parsedInput.id, email: parsedInput.email });
    return { success: true };
  });

// 3. Delete Faculty Action
export const deleteFacultyAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    const { ok } = await apiFetch('DELETE', `users/${id}`);
    if (!ok) {
      throw new Error('Failed to delete faculty member.');
    }

    revalidateTag('faculty', 'default' as any);
    logActivity('delete', 'faculty', { id });
    return { success: true };
  });

// 4. Promote to HOD Action
export const promoteToHODAction = actionClient
  .schema(facultySchema.partial()) // Reusing facultySchema as it contains basic user info
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Faculty ID is required.');
    
    // 1. Update user role/designation
    const body = { ...parsedInput, designation: 'Head of Department' };
    const { ok } = await apiFetch('PATCH', `users/${parsedInput.id}`, body);
    
    if (!ok) throw new Error('Failed to promote user to HOD.');

    // 2. Attempt to update department head if department name is known
    if (parsedInput.department) {
      const deptRes = await apiFetch('GET', `departments?limit=200`);
      if (deptRes.ok && deptRes.data?.data) {
        const match = deptRes.data.data.find(
          (d: any) => d.name?.toLowerCase() === parsedInput.department?.toLowerCase()
        );
        if (match?.id) {
          await apiFetch('PATCH', `departments/${match.id}`, { hod: parsedInput.fullName });
        }
      }
    }

    revalidateTag('faculty', 'default' as any);
    revalidateTag('departments', 'default' as any);
    logActivity('promote', 'faculty', { id: parsedInput.id, role: 'HOD' });
    return { success: true };
  });
