'use client';

import { useParams, useRouter } from 'next/navigation';
;
import { motion } from 'framer-motion';
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
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  instructor: string;
  instructorBio: string;
  semester: string;
  type: 'core' | 'elective' | 'lab';
  enrolled: number;
  capacity: number;
  rating: number;
  schedule: string;
  description: string;
  objectives: string[];
  syllabus: { week: string; topic: string; subtopics: string[] }[];
  prerequisites: string[];
  assessments: { name: string; weight: number }[];
}

const courses: Course[] = [
  {
    id: '1',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    credits: 4,
    instructor: 'Dr. Sarah Mitchell',
    instructorBio: 'PhD from MIT, 15+ years of teaching experience in algorithms and data structures. Published 50+ research papers.',
    semester: 'Fall 2024',
    type: 'core',
    enrolled: 45,
    capacity: 60,
    rating: 4.8,
    schedule: 'Mon, Wed, Fri - 10:00 AM',
    description: 'Comprehensive study of data structures including arrays, linked lists, trees, graphs, and algorithm analysis. This course provides the foundation for efficient programming and problem-solving.',
    objectives: [
      'Understand fundamental data structures and their applications',
      'Analyze algorithm complexity using Big-O notation',
      'Implement efficient solutions to computational problems',
      'Apply appropriate data structures for different scenarios',
    ],
    syllabus: [
      { week: 'Week 1-2', topic: 'Arrays and Linked Lists', subtopics: ['Array operations', 'Singly/Doubly linked lists', 'Circular lists'] },
      { week: 'Week 3-4', topic: 'Stacks and Queues', subtopics: ['Stack operations', 'Queue implementations', 'Applications'] },
      { week: 'Week 5-7', topic: 'Trees', subtopics: ['Binary trees', 'BST', 'AVL trees', 'Heap'] },
      { week: 'Week 8-10', topic: 'Graphs', subtopics: ['Graph representations', 'BFS/DFS', 'Shortest paths', 'MST'] },
      { week: 'Week 11-12', topic: 'Sorting & Searching', subtopics: ['Quick sort', 'Merge sort', 'Binary search', 'Hashing'] },
    ],
    prerequisites: ['CS101 - Programming Fundamentals', 'MA101 - Discrete Mathematics'],
    assessments: [
      { name: 'Mid-term Exam', weight: 25 },
      { name: 'End-term Exam', weight: 35 },
      { name: 'Assignments', weight: 20 },
      { name: 'Project', weight: 20 },
    ],
  },
  {
    id: '2',
    code: 'CS405',
    name: 'Machine Learning',
    department: 'Computer Science',
    credits: 3,
    instructor: 'Dr. James Wilson',
    instructorBio: 'Former Google Research Scientist, PhD from Stanford. Expert in deep learning and NLP.',
    semester: 'Fall 2024',
    type: 'elective',
    enrolled: 55,
    capacity: 55,
    rating: 4.9,
    schedule: 'Tue, Thu - 2:00 PM',
    description: 'Introduction to machine learning algorithms, neural networks, and practical applications.',
    objectives: ['Understand ML fundamentals', 'Implement ML algorithms', 'Apply deep learning'],
    syllabus: [
      { week: 'Week 1-3', topic: 'ML Fundamentals', subtopics: ['Regression', 'Classification', 'Evaluation'] },
      { week: 'Week 4-6', topic: 'Neural Networks', subtopics: ['Perceptrons', 'Backpropagation', 'CNNs'] },
    ],
    prerequisites: ['CS201 - Statistics', 'CS301 - DSA'],
    assessments: [
      { name: 'Mid-term', weight: 30 },
      { name: 'Project', weight: 40 },
      { name: 'Assignments', weight: 30 },
    ],
  },
];

export default function CourseDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const course = courses.find(c => c.id === id);
  
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Course not found</h2>
        <Button variant="outline" onClick={() => router.push('/courses')} className="mt-4">
          Back to Courses
        </Button>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/courses')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Button>

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

        {/* Enrollment Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Enrollment Status</span>
            <span className="text-sm font-medium">{course.enrolled}/{course.capacity} students</span>
          </div>
          <Progress value={enrollmentPercentage} className="h-2" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button className="flex-1" disabled={isFull}>
            {isFull ? 'Course Full' : 'Enroll in This Course'}
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download Syllabus
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Course Description</h2>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          {/* Learning Objectives */}
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

          {/* Syllabus */}
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
          {/* Instructor */}
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

          {/* Prerequisites */}
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

          {/* Assessment */}
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
    </motion.div>
  );
}
