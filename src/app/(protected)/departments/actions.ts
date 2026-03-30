'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

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

export async function createDepartment(_prev: any, formData: FormData) {
  const body = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    hod: formData.get('hod') as string,
    description: formData.get('description') as string,
  };

  const { ok } = await apiFetch('POST', 'departments', body);
  if (!ok) return { error: 'Failed to create department' };

  revalidateTag('departments');
  return { success: true };
}

export async function updateDepartment(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const body = {
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    hod: formData.get('hod') as string,
    description: formData.get('description') as string,
  };

  const { ok } = await apiFetch('PATCH', `departments/${id}`, body);
  if (!ok) return { error: 'Failed to update department' };

  revalidateTag('departments');
  return { success: true };
}

export async function deleteDepartment(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const { ok } = await apiFetch('DELETE', `departments/${id}`);
  if (!ok) return { error: 'Failed to delete department' };

  revalidateTag('departments');
  return { success: true };
}
