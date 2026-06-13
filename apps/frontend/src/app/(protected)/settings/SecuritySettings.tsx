"use client";

import React, { useState, useEffect } from 'react';
import { Button, formatDate } from "@pec/ui";
import { Lock, Smartphone, Monitor, Globe, LogOut, Loader2 } from 'lucide-react';
import { buildApiUrl } from '@pec/api';
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
    <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        <Lock className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Security & Device Management</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium  text-muted-foreground opacity-60 mb-1">Active Sessions</h3>
          <p className="text-[10px] text-muted-foreground italic font-medium mb-4">Manage the devices that are currently logged into your account</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-4 md:p-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 md:p-6 text-sm text-muted-foreground italic bg-background/40 rounded-sm border border-border/20">
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-5 rounded-sm border border-border/40 bg-background/40 hover:border-border/40 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted/30 rounded-sm">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      {getDeviceName(session.userAgent)}
                      {i === 0 && (
                         <span className="text-[9px]  font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current Device</span>
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

      {/* 2FA Configuration */}
      <TwoFactorConfig />

    </div>
  );
}

import { useAuth } from '@/features/auth/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@pec/ui';
import { ShieldCheck } from 'lucide-react';

function TwoFactorConfig() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [enabled, setEnabled] = useState(user?.isTwoFactorEnabled || false);

  const startSetup = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/auth/2fa/setup'), {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to setup 2FA');
      const data = await res.json();
      setQrCodeUrl(data.otpauthUrl);
    } catch (_err) {
      toast.error('Could not initiate 2FA setup.');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!totpToken || totpToken.length !== 6) {
      toast.error('Please enter a valid 6-digit token.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/auth/2fa/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpToken }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification failed');
      }
      toast.success('Two-Factor Authentication enabled successfully.');
      setEnabled(true);
      setQrCodeUrl('');
      setTotpToken('');
    } catch (err: any) {
      toast.error(err.message || 'Invalid token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 border-t border-border/40">
      <div className="flex items-center gap-3 pb-4">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold tracking-tight">Two-Factor Authentication (2FA)</h3>
      </div>
      
      {enabled ? (
        <div className="bg-success/10 border border-success/30 text-success p-4 rounded-sm flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" />
          <div>
            <h4 className="font-bold text-sm">2FA is currently Enabled</h4>
            <p className="text-xs opacity-90 mt-1">Your account is secured with a Time-based One-Time Password.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account by enabling Two-Factor Authentication.</p>
          
          {!qrCodeUrl ? (
            <Button onClick={startSetup} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enable 2FA
            </Button>
          ) : (
            <div className="bg-muted/30 border border-border/40 p-3 md:p-6 rounded-sm space-y-6">
              <div>
                <h4 className="font-bold text-sm mb-2">1. Scan the QR Code</h4>
                <p className="text-xs text-muted-foreground mb-4">Use Google Authenticator, Authy, or another TOTP app to scan this QR code.</p>
                <div className="bg-white p-4 inline-block rounded-sm">
                  <QRCodeSVG value={qrCodeUrl} size={150} />
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-sm mb-2">2. Enter Verification Code</h4>
                <p className="text-xs text-muted-foreground mb-4">Enter the 6-digit code generated by your app to verify setup.</p>
                <div className="flex items-center gap-4">
                  <Input 
                    type="text" 
                    placeholder="000000" 
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    maxLength={6}
                    className="max-w-[150px] text-center  font-bold"
                  />
                  <Button onClick={verifySetup} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
