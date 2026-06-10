'use client';
import { Card, CardContent, Badge } from "@pec/ui";


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

export function PageCard({ page }: { page: any }) {
  const router = useRouter();
  const Icon = page.icon;
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push(page.path)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-sm bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
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
        <div className="h-10 w-10 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
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
