'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  BookOpen, 
  Award, 
} from 'lucide-react';

interface UserDetailViewProps {
  user: any;
  enrollments: any[];
  grades: any[];
  attendance: any[];
  payments: any[];
  hostelIssues: any[];
}

export function UserDetailView({ 
  user, 
  enrollments, 
  grades, 
}: UserDetailViewProps) {
  const router = useRouter();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'college_admin': return 'destructive';
      case 'faculty': return 'secondary';
      case 'student': return 'default';
      default: return 'outline';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
        <Badge variant={getRoleBadgeColor(user.role)}>
          {user.role?.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> Info</h2>
          <div className="space-y-2 text-sm">
             <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
             <p><span className="text-muted-foreground">Phone:</span> {user.phone || 'N/A'}</p>
             <p><span className="text-muted-foreground">DOB:</span> {formatDate(user.dateOfBirth)}</p>
          </div>
        </div>
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Building2 className="w-5 h-5" /> Academic</h2>
          <div className="space-y-2 text-sm">
             <p><span className="text-muted-foreground">Dept:</span> {user.department}</p>
             <p><span className="text-muted-foreground">Role:</span> {user.role}</p>
             <p><span className="text-muted-foreground">Status:</span> 
                <Badge variant="outline" className="ml-2">{user.status || 'active'}</Badge>
             </p>
          </div>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="space-y-6">
           <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Courses</h2>
              <div className="grid gap-2">
                 {enrollments.map(e => (
                   <div key={e.id} className="p-3 border rounded-md flex justify-between items-center">
                      <span>{e.courseName}</span>
                      <Badge variant="outline">{e.status}</Badge>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5" /> Grades</h2>
              <div className="grid gap-2">
                 {grades.map(g => (
                   <div key={g.id} className="p-3 border rounded-md flex justify-between items-center">
                      <span>{g.courseCode}</span>
                      <span className="font-bold">{g.grade}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
