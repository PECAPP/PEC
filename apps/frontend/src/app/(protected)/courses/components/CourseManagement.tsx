'use client';
import { Button, Input, Badge } from "@pec/ui";
import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Search,
  FileText
} from 'lucide-react';

import { Course } from '@pec/shared';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface CourseManagementProps {
  initialCourses: Course[];
  _user: any;
}

export function CourseManagement({ initialCourses, _user }: CourseManagementProps) {
  const [courses, _setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = courses.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = useMemo<ColumnDef<Course>[]>(() => [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-sm px-2.5 py-0.5 border-border/40 font-medium text-sm  opacity-80 group-hover:border-border/40 group-hover:text-primary transition-all">
          {row.original.code}
        </Badge>
      )
    },
    {
      accessorKey: 'name',
      header: 'Curriculum Module',
      cell: ({ row }) => (
        <div className="flex flex-col">
           <Link href={`/courses/${row.original.id}`} className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">
             {row.original.name}
           </Link>
           <span className="text-[10px] text-muted-foreground/60 italic font-medium">{row.original.credits} Credits</span>
        </div>
      )
    },
    {
      accessorKey: 'department',
      header: 'Institutional Unit',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
           <span className="text-xs font-bold text-muted-foreground ">{row.original.department}</span>
        </div>
      )
    },
    {
      accessorKey: 'semester',
      header: 'Semester',
      cell: ({ row }) => <span className="text-xs font-bold text-foreground/60">{row.original.semester}</span>
    },
    {
      id: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex flex-col items-center gap-1.5">
             <span className="text-xs font-bold text-foreground/80">{course.enrolledStudents} / {course.maxStudents}</span>
             <div className="h-1 w-20 bg-muted/40 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    (course.enrolledStudents / course.maxStudents) >= 1 ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${Math.min((course.enrolledStudents / course.maxStudents) * 100, 100)}%` }}
                />
             </div>
          </div>
        );
      }
    },
    {
      id: 'operations',
      header: 'Operations',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm hover:bg-primary/10 hover:text-primary transition-colors">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-2">
         <div className="relative group/search flex-1 w-full md:">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />
            <Input 
              placeholder="Search catalog by code, name, or department..." 
              className="h-12 pl-11 rounded-sm bg-card border-border/40 focus:border-border/40 focus:ring-primary/10 transition-all font-bold placeholder:font-medium" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-sm px-3 md:px-6 font-medium text-sm  border-border/60 hover:bg-muted/40 transition-all">
              <Download className="w-4 h-4 mr-2.5 opacity-60" /> Export Catalog
            </Button>
            <Button className="flex-1 md:flex-none h-12 rounded-sm px-4 md:px-8 font-medium text-sm  bg-primary shadow-md border border-border/40 hover:scale-[1.02] transition-all">
              <Plus className="w-4 h-4 mr-2.5" /> Add New Course
            </Button>
         </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-sm shadow-sm backdrop-blur-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="p-4 bg-muted/20 rounded-full"><FileText className="w-8 h-8 text-muted-foreground/40" /></div>
             <p className="text-sm font-medium text-muted-foreground italic">No matching academic records identified.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </div>
    </div>
  );
}
