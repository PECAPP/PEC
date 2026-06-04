'use client';

import { useActionState, useOptimistic, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { enrollInCourseAction } from '../actions';

interface CourseInteractionsProps {
  isFull: boolean;
  courseId: string;
  courseCode: string;
  courseName: string;
}

const initialState = {
  success: false,
  error: null as string | null,
};

export function CourseInteractionsClient({ isFull, courseId, courseCode, courseName }: CourseInteractionsProps) {
  // useActionState (Modern React 19)
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await enrollInCourseAction(prevState, formData);
    }, 
    initialState
  );
  
  // useOptimistic (Modern UI pattern)
  const [optimisticEnrolled, setOptimisticEnrolled] = useOptimistic(state.success);

  useEffect(() => {
    if (state.success) {
      toast.success('Successfully enrolled!');
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleDownload = () => {
    toast.info('Downloading syllabus...');
  };

  if (optimisticEnrolled) {
     return (
        <div className="card-elevated p-4 bg-success/10 border-success/20 flex items-center justify-between mt-6">
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">You are enrolled in this course!</span>
           </div>
           <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <FileText className="w-4 h-4" /> Syllabus
           </Button>
        </div>
     );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <form action={async (formData) => {
          setOptimisticEnrolled(true); // Optimistic UI update
          formAction(formData);
      }} className="flex-1">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="courseCode" value={courseCode} />
        <input type="hidden" name="courseName" value={courseName} />
        <input type="hidden" name="semester" value="4" />
        
        <Button 
          type="submit"
          className="w-full" 
          disabled={isFull || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling...
            </>
          ) : isFull ? (
            'Course Full'
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Enroll for This Course
            </>
          )}
        </Button>
      </form>
      
      <Button variant="outline" type="button" onClick={handleDownload}>
         Syllabus
      </Button>
    </div>
  );
}
