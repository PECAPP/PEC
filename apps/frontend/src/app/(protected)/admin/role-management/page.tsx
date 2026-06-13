"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageBanner } from '@pec/ui';
import { Shield } from 'lucide-react';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/v1/roles-mgmt/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAssign = async () => {
    if (!userId || !roleId) return;
    try {
      const res = await fetch(`/api/v1/roles-mgmt/user/${userId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });
      if (res.ok) alert('Role assigned successfully');
      else alert('Failed to assign role');
    } catch (e) {
      alert('Error assigning role');
    }
  };

  const handleRevoke = async () => {
    if (!userId || !roleId) return;
    try {
      const res = await fetch(`/api/v1/roles-mgmt/user/${userId}/revoke/${roleId}`, {
        method: 'DELETE'
      });
      if (res.ok) alert('Role revoked successfully');
      else alert('Failed to revoke role');
    } catch (e) {
      alert('Error revoking role');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageBanner
        title="Permission Console"
        subtitle="Manage and oversee institutional role assignments"
        badgeText="Access Control"
        actions={
          <Button variant="outline" className="gap-2 bg-background/50 hover:bg-background/80 backdrop-blur-md">
            <Shield className="w-4 h-4" /> View Audit Logs
          </Button>
        }
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assign / Revoke Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-muted-foreground">User ID</label>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter User UUID" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-muted-foreground">Role ID</label>
              <Input value={roleId} onChange={(e) => setRoleId(e.target.value)} placeholder="Enter Role UUID or Name" />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleAssign}>Assign Role</Button>
              <Button variant="destructive" onClick={handleRevoke}>Revoke Role</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles found.</p>
            ) : (
              <ul className="space-y-2">
                {roles.map((r: any) => (
                  <li key={r.id} className="text-sm border-b pb-2 flex justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground text-xs">{r.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
