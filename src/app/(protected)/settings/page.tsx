'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  LogOut,
  Palette,
  Check,
  RefreshCw,
  Database,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { authClient } from '@/lib/auth-client';
import { LoadingGrid } from '@/components/common/AsyncState';
import CollegeSettings from './admin/CollegeSettings';

const extractData = <T,>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export default function Settings() {
  const router = useRouter();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const accentColors = [
    { id: 'gold', name: 'PEC Gold', color: '#EAB308' },
    { id: 'emerald', name: 'Emerald', color: '#10B981' },
    { id: 'sapphire', name: 'Sapphire', color: '#3B82F6' },
    { id: 'amethyst', name: 'Amethyst', color: '#8B5CF6' },
  ];

  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accent-color') || 'gold';
    }
    return 'gold';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    accentColors.forEach(({ id }) => root.classList.remove(`accent-${id}`));
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem('accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace('/auth');
      return;
    }

    const loadUserData = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        setUserData(extractData<any>(profileRes.data) || {});
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadUserData();
  }, [authLoading, router, user]);

  const handleSignOut = async () => {
    try {
      await authClient.logout();
      window.dispatchEvent(new Event('auth-change'));
      toast.success('Signed out successfully');
      router.replace('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-28 rounded-md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
        <div className="space-y-2">
          <h1 className="text-5xl font-[1000] tracking-tighter text-foreground uppercase leading-none">Settings Engine</h1>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-90">Synchronize Neural Environment Layer</p>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="h-10 rounded-xl hover:bg-destructive/10 text-destructive font-black uppercase text-[10px] tracking-widest gap-2">
           <LogOut className="w-5 h-5" /> Terminate Access
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="flex flex-wrap h-auto bg-transparent border-b rounded-none p-0 gap-8 justify-start">
          {['profile', 'appearance', 'notifications', 'privacy', 'connected', 'security'].map(tab => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
            >
              {tab.replace('-', ' ')}
            </TabsTrigger>
          ))}
          {user?.role === 'college_admin' && (
            <TabsTrigger value="college" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-xs font-black uppercase tracking-widest transition-all">
              College Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-primary/10 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Personal Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Access Name</label>
                <Input value={userData?.fullName || ''} className="h-11 rounded-xl bg-background border-primary/10 font-bold" readOnly />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Protocol Line</label>
                <Input value={userData?.email || ''} className="h-11 rounded-xl bg-muted border-primary/5 opacity-70" disabled />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Secure Contact</label>
                <Input placeholder="+91 XXX-XXX-XXXX" className="h-11 rounded-xl bg-background border-primary/10 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Department</label>
                <Input value={userData?.department || 'N/A'} className="h-11 rounded-xl bg-muted border-primary/5 opacity-70" disabled />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest">
                  <RefreshCw className="w-4 h-4 mr-2" /> Sync Records
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Environment Constants
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Native Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger className="h-11 rounded-xl bg-background border-primary/10 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/10">
                      <SelectItem value="en" className="font-bold">English (Intl)</SelectItem>
                      <SelectItem value="hi" className="font-bold">Hindi (Dev)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-primary/10 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <Palette className="w-4 h-4" />
                Surface Theme
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase">Configure cognitive visual overlays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                      accentColor === color.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-primary/5 bg-background hover:border-primary/20"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg"
                      style={{ background: color.color }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {color.name}
                    </span>
                    {accentColor === color.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
