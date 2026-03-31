'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { facultySchema } from '@shared/schemas/erp';
import { logActivity } from '@/lib/logger';
import { z } from 'zod';

const API = process.env.INTERNAL_API_URL ?? 'http://localhost:8000';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? '';
}

async function apiFetch(method: string, path: string, body?: object) {
  const token = await getToken();
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = res.ok ? await res.json().catch(() => null) : null;
  return { ok: res.ok, status: res.status, data };
}

// 1. Create Faculty Action
export const createFacultyAction = actionClient
  .schema(facultySchema as any)
  .action(async ({ parsedInput }: { parsedInput: any }) => {
    const body = { ...(parsedInput as object), role: 'faculty' };
    const { ok } = await apiFetch('POST', 'users', body);
    
    if (!ok) {
      throw new Error('Failed to create faculty member via gateway API.');
    }

    revalidateTag('faculty', 'default');
    logActivity('create', 'faculty', { name: parsedInput.fullName, email: parsedInput.email });
    return { success: true };
  });

// 2. Update Faculty Action
export const updateFacultyAction = actionClient
  .schema(facultySchema as any)
  .action(async ({ parsedInput }: { parsedInput: any }) => {
    if (!parsedInput.id) throw new Error('Faculty ID is required for updates.');
    
    const { ok } = await apiFetch('PATCH', `users/${parsedInput.id}`, parsedInput);
    if (!ok) {
      throw new Error('Failed to update faculty member.');
    }

    revalidateTag('faculty', 'default');
    logActivity('update', 'faculty', { id: parsedInput.id, email: parsedInput.email });
    return { success: true };
  });

// 3. Delete Faculty Action
export const deleteFacultyAction = actionClient
  .schema(z.object({ id: z.string() }) as any)
  .action(async ({ parsedInput }: { parsedInput: { id: string } }) => {
    const { id } = parsedInput;
    const { ok } = await apiFetch('DELETE', `users/${id}`);
    if (!ok) {
      throw new Error('Failed to delete faculty member.');
    }

    revalidateTag('faculty', 'default');
    logActivity('delete', 'faculty', { id });
    return { success: true };
  });

// 4. Promote to HOD Action
export const promoteToHODAction = actionClient
  .schema(facultySchema as any) // Reusing facultySchema as it contains basic user info
  .action(async ({ parsedInput }: { parsedInput: any }) => {
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

    revalidateTag('faculty', 'default');
    revalidateTag('departments', 'default');
    logActivity('promote', 'faculty', { id: parsedInput.id, role: 'HOD' });
    return { success: true };
  });
