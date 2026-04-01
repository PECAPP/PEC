'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { userSchema } from '@shared/schemas/erp';
import { logActivity } from '@/lib/logger';
import { resolveInternalApiBaseUrl } from '@/lib/internal-api-url';
import { z } from 'zod';

const API = resolveInternalApiBaseUrl();

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? '';
}

async function apiFetch(method: string, path: string, body?: object) {
  const token = await getToken();
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = res.ok ? await res.json().catch(() => null) : null;
  return { ok: res.ok, status: res.status, data };
}

// 1. Create User
export const createUserAction = actionClient
  .schema(userSchema)
  .action(async ({ parsedInput }) => {
    const { ok, data } = await apiFetch('POST', 'users', parsedInput as object);
    if (!ok) throw new Error('Failed to create user account.');
    revalidateTag('users', 'default');
    logActivity('create', 'user', { email: parsedInput.email, role: parsedInput.role });
    return { success: true, id: data?.id };
  });

// 2. Update User
export const updateUserAction = actionClient
  .schema(userSchema.partial())
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('User ID required for updates.');
    const { ok } = await apiFetch('PATCH', `users/${parsedInput.id}`, parsedInput);
    if (!ok) throw new Error('Failed to update user.');
    revalidateTag('users', 'default');
    logActivity('update', 'user', { id: parsedInput.id, email: parsedInput.email });
    return { success: true };
  });

// 3. Delete User
export const deleteUserAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    const { ok } = await apiFetch('DELETE', `users/${id}`);
    if (!ok) throw new Error('Failed to delete user.');
    revalidateTag('users', 'default');
    logActivity('delete', 'user', { id });
    return { success: true };
  });

// 4. Change User Status (suspend / activate)
export const changeStatusAction = actionClient
  .schema(z.object({ id: z.string(), status: z.enum(['active', 'inactive', 'suspended']) }))
  .action(async ({ parsedInput }) => {
    const { id, status } = parsedInput;
    const { ok } = await apiFetch('PATCH', `users/${id}`, { status });
    if (!ok) throw new Error('Failed to update user status.');
    revalidateTag('users', 'default');
    logActivity('status_change', 'user', parsedInput);
    return { success: true };
  });
