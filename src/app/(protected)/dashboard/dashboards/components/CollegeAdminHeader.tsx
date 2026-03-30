'use client';

import { Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CollegeAdminHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Institution Dashboard</h1>
        <p className="text-muted-foreground">Manage your college operations and analytics</p>
      </div>
      <div className="flex gap-2">
        <Link href="/reports">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </Link>
        <Link href="/users/add">
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>
    </div>
  );
}
