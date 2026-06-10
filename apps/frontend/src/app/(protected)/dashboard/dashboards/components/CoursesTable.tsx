'use client';
import { Button, Badge, Input } from "@pec/ui";

import { Plus, Edit, Trash2 } from 'lucide-react';
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
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEditCourse(row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDeleteCourse(row.original.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ], [onEditCourse, onDeleteCourse]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input 
          placeholder="Search courses..." 
          className=" w-full" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button onClick={onAddCourse} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />Add Course
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <DataTable columns={columns} data={courses} />
      </div>
    </div>
  );
}
