'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/logger';
import { resolveInternalApiBaseUrl } from '@/lib/internal-api-url';
import { facultySchema } from '@/lib/schemas';

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

export async function createFaculty(_prev: any, formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    role: 'faculty',
    department: formData.get('department') || undefined,
    employeeId: formData.get('employeeId') || undefined,
    designation: formData.get('designation') || undefined,
    specialization: formData.get('specialization') || undefined,
    phone: formData.get('phone') || undefined,
  };

  const validation = facultySchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { ok } = await apiFetch('POST', 'users', validation.data);
  if (!ok) return { error: 'Failed to create faculty member' };

  revalidateTag('faculty', 'default');
  logActivity('create', 'faculty', { name: validation.data.fullName, email: validation.data.email });
  return { success: true };
}

export async function updateFaculty(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const rawData = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    department: formData.get('department') || undefined,
    employeeId: formData.get('employeeId') || undefined,
    designation: formData.get('designation') || undefined,
    specialization: formData.get('specialization') || undefined,
    phone: formData.get('phone') || undefined,
  };

  const validation = facultySchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { ok } = await apiFetch('PATCH', `users/${id}`, validation.data);
  if (!ok) return { error: 'Failed to update faculty member' };

  revalidateTag('faculty', 'default');
  logActivity('update', 'faculty', { id, email: validation.data.email });
  return { success: true };
}

export async function deleteFaculty(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const { ok } = await apiFetch('DELETE', `users/${id}`);
  if (!ok) return { error: 'Failed to delete faculty member' };

  revalidateTag('faculty', 'default');
  logActivity('delete', 'faculty', { id });
  return { success: true };
}

export async function promoteToHOD(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const body = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    role: 'faculty',
    department: formData.get('department') as string,
    employeeId: formData.get('employeeId') || undefined,
    designation: 'Head of Department',
    specialization: formData.get('specialization') || undefined,
    phone: formData.get('phone') || undefined,
  };

  const { ok } = await apiFetch('PATCH', `users/${id}`, body);
  if (!ok) return { error: 'Failed to promote faculty' };

  // Also update the department's HOD field
  const deptName = formData.get('department') as string;
  const fullName = formData.get('fullName') as string;
  const deptRes = await apiFetch('GET', `departments?limit=200`);
  if (deptRes.ok && deptRes.data?.data) {
    const match = deptRes.data.data.find(
      (d: any) => d.name?.toLowerCase() === deptName.toLowerCase()
    );
    if (match?.id) {
      await apiFetch('PATCH', `departments/${match.id}`, { hod: fullName });
    }
  }

  revalidateTag('faculty', 'default');
  revalidateTag('departments', 'default');
  logActivity('promote', 'faculty', { id, role: 'HOD' });
  return { success: true };
}
