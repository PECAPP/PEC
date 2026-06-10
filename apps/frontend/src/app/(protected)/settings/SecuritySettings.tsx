"use client";

import React, { useState, useEffect } from 'react';
import { Button, formatDate } from "@pec/ui";
import { Lock, Smartphone, Monitor, Globe, LogOut, Loader2 } from 'lucide-react';
import { authClient, buildApiUrl } from '@pec/api';
import { toast } from 'sonner';

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export function SecuritySettings() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch(buildApiUrl('/auth/sessions'), {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (_err) {
      toast.error('Could not load active sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(buildApiUrl(`/auth/sessions/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to revoke session');
      toast.success('Session revoked successfully.');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (_err) {
      toast.error('Failed to revoke session.');
    }
  };

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Globe className="w-5 h-5 text-muted-foreground" />;
    if (ua.toLowerCase().includes('mobile') || ua.toLowerCase().includes('android') || ua.toLowerCase().includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-muted-foreground" />;
    }
    return <Monitor className="w-5 h-5 text-muted-foreground" />;
  };

  const getDeviceName = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac OS')) return 'Mac';
    if (ua.includes('Linux')) return 'Linux PC';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android Device';
    return 'Unknown Device';
  };

  return (
    <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        <Lock className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Security & Device Management</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Active Sessions</h3>
          <p className="text-[10px] text-muted-foreground italic font-medium mb-4">Manage the devices that are currently logged into your account</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-8 text-sm text-muted-foreground italic bg-background/40 rounded-sm border border-border/20">
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-sm border border-border/40 bg-background/40 hover:border-primary/20 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted/30 rounded-sm">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      {getDeviceName(session.userAgent)}
                      {i === 0 && (
                         <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current Device</span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.ipAddress || 'Unknown IP'} • Started {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                {i !== 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRevoke(session.id)}
                    className="shrink-0 h-9 rounded-sm border-destructive/20 text-destructive hover:bg-destructive/5 font-bold text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
