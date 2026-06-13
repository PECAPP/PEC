'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { actionClient } from '@/lib/safe-action';
import { departmentSchema } from '@pec/shared';
import { logActivity } from '@/lib/logger';
import { z } from 'zod';
import { apiFetch } from '@/lib/api-fetch';

// 1. Create Department Action
export const createDepartmentAction = actionClient
  .schema(departmentSchema)
  .action(async ({ parsedInput }) => {
    const { ok } = await apiFetch('POST', 'departments', parsedInput);
    
    if (!ok) {
      throw new Error('Failed to create department via gateway API.');
    }

    revalidateTag('departments', 'default');
    logActivity('create', 'department', { name: parsedInput.name, code: parsedInput.code });
    return { success: true };
  });

// 2. Update Department Action
export const updateDepartmentAction = actionClient
  .schema(departmentSchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Department ID is required for updates.');
    
    const { ok } = await apiFetch('PATCH', `departments/${parsedInput.id}`, parsedInput);
    if (!ok) {
      throw new Error('Failed to update department via gateway API.');
    }

    revalidateTag('departments', 'default');
    logActivity('update', 'department', { id: parsedInput.id, name: parsedInput.name });
    return { success: true };
  });

// 3. Delete Department Action
export const deleteDepartmentAction = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const { ok } = await apiFetch('DELETE', `departments/${id}`);
    if (!ok) {
      throw new Error('Failed to delete department.');
    }

    revalidateTag('departments', 'default');
    logActivity('delete', 'department', { id });
    return { success: true };
  });
