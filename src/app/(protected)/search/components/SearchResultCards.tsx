'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserCard({ user }: { user: any }) {
  const router = useRouter();
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {user.fullName?.[0] || 'U'}
        </div>
        <div>
          <p className="font-medium text-foreground">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.role} • {user.department || 'General'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobCard({ job }: { job: any }) {
  const router = useRouter();
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push(`/career`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
             <h3 className="font-medium text-foreground">{job.title}</h3>
             <div className="flex items-center gap-1 text-sm text-muted-foreground">
               <Building2 className="w-3 h-3" /> {job.companyName}
             </div>
          </div>
          <Badge variant="outline">{job.type}</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Posted {job.postedAt?.toDate ? job.postedAt.toDate().toLocaleDateString() : 'Recently'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DriveCard({ drive }: { drive: any }) {
  const router = useRouter();
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push(`/placements/drives`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
           <div>
             <h3 className="font-medium text-foreground">{drive.companyName}</h3>
             <p className="text-sm text-primary">{drive.role}</p>
           </div>
           <Badge variant={drive.status === 'upcoming' ? 'default' : 'secondary'}>{drive.status}</Badge>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" /> 
          {drive.date?.toDate ? drive.date.toDate().toLocaleDateString() : 'TBD'}
          <span className="mx-1">•</span>
          {drive.venue || 'Campus'}
        </div>
      </CardContent>
    </Card>
  );
}

export function PageCard({ page }: { page: any }) {
  const router = useRouter();
  const Icon = page.icon;
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push(page.path)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{page.title}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {page.keywords?.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubjectCard({ subject }: { subject: any }) {
  const router = useRouter();
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push(`/courses`)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
          {subject.code?.slice(0,2) || 'CS'}
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
          <p className="text-xs text-muted-foreground">
            {subject.code} • {subject.credits} Credits
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
