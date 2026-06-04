import { Suspense } from 'react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Video, 
  User, 
  Award 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { CourseInteractionsClient as CourseInteractions } from './CourseInteractionsClient';
import { getServerSession } from '@/lib/server-auth';
import { extractData } from '@/lib/utils';

// This is the new Next.js 15+ Server Component pattern
interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourse(id);
  
  if (!course) return { title: 'Course Not Found' };
  
  return {
     title: `${course.code}: ${course.name} | PEC APP`,
     description: course.description,
  };
}

/**
 * Mock data fetcher - will be replaced by Prisma/API in production.
 * In Next.js 16, fetching directly in the component is the standard.
 */
async function getCourse(id: string) {
  const session = await getServerSession();
  const rawBase =
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '/api';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const base = rawBase.startsWith('http')
    ? rawBase.replace(/\/$/, '')
    : new URL(rawBase, siteUrl).toString().replace(/\/$/, '');

  try {
    const response = await fetch(`${base}/courses/${id}`, {
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : undefined,
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    return extractData<any>(payload) || null;
  } catch {
    return null;
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Course not found</h2>
        <Link href="/courses">
          <Button variant="outline" className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-primary/10 text-primary';
      case 'elective': return 'bg-accent/10 text-accent';
      case 'lab': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const enrollmentPercentage = (course.enrolled / course.capacity) * 100;
  const isFull = course.enrolled >= course.capacity;

  return (
    <div className="space-y-6">
      <Link href="/courses">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted-foreground">{course.code}</span>
                  <Badge className={getTypeColor(course.type)}>
                    {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{course.name}</h1>
                <p className="text-muted-foreground mt-1">{course.department}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {course.credits} Credits
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {course.schedule}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {course.semester}
                  </span>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="flex items-center gap-1 justify-center lg:justify-end">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="text-2xl font-bold text-foreground">{course.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">Course Rating</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Enrollment Status & Client Interactions */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enrollment Status</span>
              <span className="text-sm font-medium">{course.enrolled}/{course.capacity} students</span>
            </div>
            <Progress value={enrollmentPercentage} className="h-2" />
          </div>
          
          <Suspense fallback={<div className="h-10 bg-secondary animate-pulse rounded-md" />}>
             <CourseInteractions 
               isFull={isFull} 
               courseId={course.id} 
               courseCode={course.code} 
               courseName={course.name} 
             />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Course Description</h2>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Learning Objectives</h2>
            <ul className="space-y-3">
              {course.objectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Course Syllabus</h2>
            <Accordion type="single" collapsible className="w-full">
              {course.syllabus.map((week, i) => (
                <AccordionItem key={i} value={`week-${i}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{week.week}</Badge>
                      <span className="font-medium">{week.topic}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4">
                      {week.subtopics.map((subtopic, j) => (
                        <li key={j} className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {subtopic}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Instructor
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {course.instructor.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-foreground">{course.instructor}</p>
                <p className="text-sm text-muted-foreground">{course.department}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{course.instructorBio}</p>
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Prerequisites</h3>
            <ul className="space-y-2">
              {course.prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Assessment Breakdown
            </h3>
            <div className="space-y-3">
              {course.assessments.map((assessment, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{assessment.name}</span>
                    <span className="font-medium text-foreground">{assessment.weight}%</span>
                  </div>
                  <Progress value={assessment.weight} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
