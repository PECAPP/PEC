import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UserAssignmentUI() {
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [roles, setRoles] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (userId.length > 5) {
      const delayFn = setTimeout(() => {
        fetchUserActiveRoles(userId);
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setActiveRoles([]);
    }
  }, [userId]);

  const fetchUserActiveRoles = async (id: string) => {
    setLoadingRoles(true);
    try {
      const res = await fetch(`/api/v1/roles/user/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveRoles(data);
      }
    } catch (e) {
      console.error('Failed to fetch user roles', e);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/v1/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async () => {
    if (!userId || !roleId) return;
    try {
      const res = await fetch(`/api/v1/roles/user/${userId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roleId,
          validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
          validUntil: validUntil ? new Date(validUntil).toISOString() : undefined
        })
      });
      if (res.ok) {
        alert('Role assigned successfully');
        setRoleId(''); setValidFrom(''); setValidUntil('');
        fetchUserActiveRoles(userId);
      } else {
        alert('Failed to assign role');
      }
    } catch (e) {
      alert('Error assigning role');
    }
  };

  const handleRevoke = async () => {
    if (!userId || !roleId) return;
    try {
      const res = await fetch(`/api/v1/roles/user/${userId}/revoke/${roleId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Role revoked successfully');
        fetchUserActiveRoles(userId);
      }
      else alert('Failed to revoke role');
    } catch (e) {
      alert('Error revoking role');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-card/40 border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Identity & Role Assignment
          </CardTitle>
          <p className="text-sm text-muted-foreground">Assign permanent or temporary roles to specific users.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-bold text-muted-foreground">Target User ID</label>
              <Input 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                placeholder="Enter User UUID..." 
                className="bg-background/50 border-border/60" 
              />
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> User UUID must perfectly match their directory record.
              </p>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-bold text-muted-foreground">Target Role</label>
              <select 
                value={roleId} 
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border/60 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select a Role --</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div>
                <label className="mb-1 text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Valid From (Optional)
                </label>
                <Input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="bg-background/50 h-9 text-xs" />
              </div>
              <div>
                <label className="mb-1 text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Valid Until (Optional)
                </label>
                <Input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="bg-background/50 h-9 text-xs" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Leaving dates blank grants the role indefinitely.</p>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleAssign} className="w-full font-bold">Grant Access</Button>
              <Button variant="destructive" onClick={handleRevoke} className="w-full font-bold">Revoke Access</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Recent User Assignments</CardTitle>
          <p className="text-sm text-muted-foreground">Check active temporal or permanent assignments.</p>
        </CardHeader>
        <CardContent>
          {userId.length <= 5 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border/40 rounded-md bg-muted/10">
              <Users className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">No target user selected.</p>
              <p className="text-xs text-muted-foreground opacity-60">Enter a User ID to view their active roles.</p>
            </div>
          ) : loadingRoles ? (
            <div className="flex items-center justify-center h-48">
              <span className="text-sm text-muted-foreground animate-pulse">Fetching active assignments...</span>
            </div>
          ) : activeRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border/40 rounded-md bg-muted/10">
              <AlertCircle className="w-6 h-6 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">This user has no active roles assigned.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRoles.map((ur: any) => (
                <div key={ur.roleId} className="flex flex-col gap-2 p-3 border border-border/60 rounded-md bg-background/50 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold block">{ur.role?.name || ur.roleId}</span>
                      {ur.role?.isSystem ? (
                        <Badge className="bg-primary/20 text-primary mt-1 text-[10px]">System</Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-1 text-[10px]">Custom</Badge>
                      )}
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => {
                      setRoleId(ur.roleId);
                      setTimeout(handleRevoke, 100);
                    }} className="h-7 text-[10px] px-2">Revoke</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-2">
                    <div>
                      <span className="font-bold block">Valid From</span>
                      {ur.validFrom ? new Date(ur.validFrom).toLocaleDateString() : 'Indefinite'}
                    </div>
                    <div>
                      <span className="font-bold block">Valid Until</span>
                      {ur.validUntil ? new Date(ur.validUntil).toLocaleDateString() : 'Indefinite'}
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold">Granted By:</span> {ur.grantedBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
