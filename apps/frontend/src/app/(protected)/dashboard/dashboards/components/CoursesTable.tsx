'use client';
import { Button, Badge, Input } from "@pec/ui";

import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface CoursesTableProps {
  courses: any[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddCourse: () => void;
  onEditCourse: (course: any) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function CoursesTable({ 
  courses, 
  searchQuery,
  onSearchChange,
  onAddCourse, 
  onEditCourse, 
  onDeleteCourse 
}: CoursesTableProps) {
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.code}</span>
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="text-foreground">{row.original.name}</span>
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.department}</span>
    },
    {
      accessorKey: 'semester',
      header: 'Semester',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.semester}</span>
    },
    {
      id: 'enrolled',
      header: 'Enrolled',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.enrolledStudents || 0}/{row.original.maxStudents || 60}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted transition-colors" onClick={() => onEditCourse(row.original)}>
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-destructive/10 transition-colors" onClick={() => onDeleteCourse(row.original.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ], [onEditCourse, onDeleteCourse]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9 h-10 w-full border rounded-sm bg-background/50" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddCourse} className="w-full sm:w-auto h-10 bg-primary text-primary-foreground font-medium rounded-sm px-4 whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />Add Course
        </Button>
      </div>

      <DataTable columns={columns} data={courses} />
    </div>
  );
}
