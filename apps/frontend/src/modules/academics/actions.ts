'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { enrollmentSchema, courseSchema } from '@shared/schemas/erp';
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

// ─── Course Actions ────────────────────────────────────────────────────
export const createCourseAction = actionClient
  .schema(courseSchema)
  .action(async ({ parsedInput }) => {
    const { ok, data } = await apiFetch('POST', 'courses', parsedInput);
    if (!ok) throw new Error('Failed to create course.');
    revalidateTag('courses', 'default');
    logActivity('create', 'course', { name: parsedInput.name, code: parsedInput.code });
    return { success: true, id: data?.id };
  });

export const updateCourseAction = actionClient
  .schema(courseSchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Course ID required.');
    const { ok } = await apiFetch('PATCH', `courses/${parsedInput.id}`, parsedInput);
    if (!ok) throw new Error('Failed to update course.');
    revalidateTag('courses', 'default');
    logActivity('update', 'course', { id: parsedInput.id });
    return { success: true };
  });

export const deleteCourseAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const { ok } = await apiFetch('DELETE', `courses/${id}`);
    if (!ok) throw new Error('Failed to delete course.');
    revalidateTag('courses', 'default');
    logActivity('delete', 'course', { id });
    return { success: true };
  });

// ─── Enrollment Actions ────────────────────────────────────────────────
export const enrollStudentAction = actionClient
  .schema(enrollmentSchema)
  .action(async ({ parsedInput }) => {
    const { ok, data } = await apiFetch('POST', 'enrollments', parsedInput);
    if (!ok) throw new Error('Enrollment failed for this student/course combination.');
    revalidateTag('enrollments', 'default');
    logActivity('create', 'enrollment', { studentId: parsedInput.studentId, courseId: parsedInput.courseId });
    return { success: true, id: data?.id };
  });

export const withdrawEnrollmentAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const { ok } = await apiFetch('PATCH', `enrollments/${id}`, { status: 'withdrawn' });
    if (!ok) throw new Error('Failed to withdraw enrollment.');
    revalidateTag('enrollments', 'default');
    logActivity('withdraw', 'enrollment', { id });
    return { success: true };
  });
