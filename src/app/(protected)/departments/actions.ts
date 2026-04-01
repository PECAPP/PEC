'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/logger';
import { resolveInternalApiBaseUrl } from '@/lib/internal-api-url';
import { departmentSchema } from '@/lib/schemas';

const API = resolveInternalApiBaseUrl();

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

export async function createDepartment(_prev: any, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    hod: formData.get('hod') as string,
    description: formData.get('description') as string,
  };

  const validation = departmentSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { ok } = await apiFetch('POST', 'departments', validation.data);
  if (!ok) return { error: 'Failed to create department' };

  revalidateTag('departments', 'default');
  logActivity('create', 'department', { name: validation.data.name, code: validation.data.code });
  return { success: true };
}

export async function updateDepartment(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const rawData = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    hod: formData.get('hod') as string,
    description: formData.get('description') as string,
  };

  const validation = departmentSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { ok } = await apiFetch('PATCH', `departments/${id}`, validation.data);
  if (!ok) return { error: 'Failed to update department' };

  revalidateTag('departments', 'default');
  logActivity('update', 'department', { id, name: validation.data.name });
  return { success: true };
}

export async function deleteDepartment(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const { ok } = await apiFetch('DELETE', `departments/${id}`);
  if (!ok) return { error: 'Failed to delete department' };

  revalidateTag('departments', 'default');
  logActivity('delete', 'department', { id });
  return { success: true };
}
