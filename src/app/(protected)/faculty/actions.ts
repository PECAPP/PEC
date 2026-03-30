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

export async function createFaculty(_prev: any, formData: FormData) {
  const body = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    role: 'faculty',
    department: formData.get('department') || undefined,
    employeeId: formData.get('employeeId') || undefined,
    designation: formData.get('designation') || undefined,
    specialization: formData.get('specialization') || undefined,
    phone: formData.get('phone') || undefined,
  };

  const { ok } = await apiFetch('POST', 'users', body);
  if (!ok) return { error: 'Failed to create faculty member' };

  revalidateTag('faculty');
  return { success: true };
}

export async function updateFaculty(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const body = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    department: formData.get('department') || undefined,
    employeeId: formData.get('employeeId') || undefined,
    designation: formData.get('designation') || undefined,
    specialization: formData.get('specialization') || undefined,
    phone: formData.get('phone') || undefined,
  };

  const { ok } = await apiFetch('PATCH', `users/${id}`, body);
  if (!ok) return { error: 'Failed to update faculty member' };

  revalidateTag('faculty');
  return { success: true };
}

export async function deleteFaculty(_prev: any, formData: FormData) {
  const id = formData.get('id') as string;
  const { ok } = await apiFetch('DELETE', `users/${id}`);
  if (!ok) return { error: 'Failed to delete faculty member' };

  revalidateTag('faculty');
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

  revalidateTag('faculty');
  revalidateTag('departments');
  return { success: true };
}
