'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { attendanceSchema } from '@pec/shared';
import { logActivity } from '@/lib/logger';
import { z } from 'zod';
import { apiFetch } from '@/lib/api-fetch';

// 1. Single Attendance Record (Upsert)
export const markAttendanceAction = actionClient
  .schema(attendanceSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    let result;
    
    if (id) {
       result = await apiFetch('PATCH', `attendance/${id}`, body);
    } else {
       result = await apiFetch('POST', 'attendance', body);
    }
    
    if (!result.ok) throw new Error('API Sync Failure: Attendance record not processed.');

    revalidateTag('attendance', 'default');
    return { success: true, id: result.data?.id || id };
  });

// 2. Bulk Session Record (Used for saving entire class roll)
export const markBulkAttendanceAction = actionClient
  .schema(z.object({
    records: z.array(attendanceSchema)
  }))
  .action(async ({ parsedInput }) => {
    for (const record of parsedInput.records) {
      const { id, ...body } = record;
      if (id) {
        await apiFetch('PATCH', `attendance/${id}`, body);
      } else {
        await apiFetch('POST', 'attendance', body);
      }
    }

    revalidateTag('attendance', 'default');
    logActivity('bulk_mark', 'attendance', { count: parsedInput.records.length });
    return { success: true };
  });

// 3. Fetch Student Summary (used for SSR/PPR)
export async function getAttendanceRecord(studentId: string) {
    const res = await apiFetch('GET', `attendance?studentId=${studentId}&limit=100`);
    return res.data;
}
