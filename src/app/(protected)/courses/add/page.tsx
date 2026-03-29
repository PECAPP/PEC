'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
;
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AddCourse() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Course Created",
      description: "New course has been created successfully.",
    });
    router.push('/courses');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard?role=college_admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground">Add a new course to the curriculum</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input id="courseCode" placeholder="CS601" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input id="courseName" placeholder="Artificial Intelligence" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                <SelectItem value="ece">Electronics & Communication</SelectItem>
                <SelectItem value="me">Mechanical Engineering</SelectItem>
                <SelectItem value="ce">Civil Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Input id="credits" type="number" placeholder="4" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Dr. Rajesh Kumar</SelectItem>
                <SelectItem value="2">Dr. Priya Menon</SelectItem>
                <SelectItem value="3">Dr. Amit Verma</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Course Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the course..."
            rows={4}
          />
        </div>

        {/* Syllabus */}
        <div className="space-y-2">
          <Label htmlFor="syllabus">Syllabus Topics</Label>
          <Textarea
            id="syllabus"
            placeholder="Enter syllabus topics (one per line)"
            rows={6}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" variant="gradient" className="flex-1">
            Create Course
          </Button>
          <Link href="/dashboard?role=college_admin" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
