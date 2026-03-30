'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from '@/lib/server-auth';

const enrollmentSchema = z.object({
  courseId: z.string().min(1),
  courseCode: z.string().min(1),
  courseName: z.string().min(1),
  semester: z.number().int(),
});

export async function enrollInCourseAction(prevState: any, formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Parse form data
  const data = {
    courseId: formData.get('courseId') as string,
    courseCode: formData.get('courseCode') as string,
    courseName: formData.get('courseName') as string,
    semester: Number(formData.get('semester')),
  };

  // Validate
  const validated = enrollmentSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid form data' };
  }

  const API_URL = process.env.INTERNAL_API_URL || process.env.API_URL || "http://localhost:8000";

  try {
     const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
           studentId: session.uid,
           ...validated.data,
           status: 'active',
        }),
     });

     if (!response.ok) {
        return { success: false, error: 'Failed to enroll in course' };
     }

     // Trigger cache revalidation on the server
     revalidatePath('/courses');
     revalidatePath(`/courses/${validated.data.courseId}`);
     revalidatePath('/dashboard');

     return { success: true, error: null };
  } catch (error) {
     return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function dropCourseAction(courseId: string) {
  const session = await getServerSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const API_URL = process.env.INTERNAL_API_URL || process.env.API_URL || "http://localhost:8000";

  try {
     const response = await fetch(`${API_URL}/enrollments?studentId=${session.uid}&courseId=${courseId}`, {
        method: 'DELETE',
        headers: {
           'Authorization': `Bearer ${session.token}`
        },
     });

     if (!response.ok) {
        return { success: false, error: 'Failed to drop course' };
     }

     revalidatePath('/courses');
     revalidatePath('/dashboard');

     return { success: true };
  } catch (e) {
     return { success: false, error: 'An unexpected error occurred' };
  }
}
