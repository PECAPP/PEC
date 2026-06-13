import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, ArrowRight, Loader2 } from 'lucide-react';
import CustomPolicyModal from './CustomPolicyModal';
import CustomRoleModal from './CustomRoleModal';

export default function RoleMatrixGrid() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/v1/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <Card className="bg-card/40 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Role & Policy Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">Comprehensive view of institutional roles and their absolute capabilities.</p>
        </div>
        <div className="flex items-center gap-2">
          <CustomPolicyModal onSuccess={fetchRoles} />
          <CustomRoleModal onSuccess={fetchRoles} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/40 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Role Name</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium w-1/2">Mapped Policies (Action : Subject)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-background/30">
              {roles.map((role: any) => (
                <tr key={role.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-4 font-bold text-foreground">
                    <div className="flex flex-col">
                      <span>{role.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{role.description || 'No description provided'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="bg-background/50">{role.hierarchy}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    {role.isSystem ? (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">System</Badge>
                    ) : (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions?.length > 0 ? (
                        role.permissions.map((rp: any) => (
                          <div key={rp.permission.id} className="flex items-center gap-1 text-[11px] bg-muted/60 px-2 py-1 rounded-sm border border-border/40">
                            <Key className="w-3 h-3 text-emerald-500" />
                            <span className="font-medium">{rp.permission.action}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                            <span className="text-muted-foreground">{rp.permission.subject}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No specific policies attached</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No roles found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
