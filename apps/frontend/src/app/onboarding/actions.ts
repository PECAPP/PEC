'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';

const profileSchema = z.object({
  role: z.string(),
  // Student fields
  enrollmentNumber: z.string().optional(),
  department: z.string().optional(),
  semester: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  // Faculty/Admin fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  responsibilities: z.string().optional(),
});

export async function completeProfileStatefulAction(prevState: any, formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validated = profileSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: 'Invalid form data' };
  }

  const API_URL = process.env.INTERNAL_API_URL || process.env.API_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${API_URL}/api/auth/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({
        ...validated.data,
        userId: session.uid,
        email: session.email,
        fullName: session.fullName,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to update profile on backend' };
    }

    // Refresh state
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
