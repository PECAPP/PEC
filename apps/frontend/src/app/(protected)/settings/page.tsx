"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Label } from "@pec/ui";


import React, { useState, useEffect } from 'react';
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  Lock, 
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  Monitor,  Settings as SettingsIcon
} from 'lucide-react';
import { useTheme } from "next-themes";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { LoadingGrid } from '@/components/common/AsyncState';
import { SecuritySettings } from './SecuritySettings';
import { PrivacySettings } from './components/PrivacySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { NetworkSettings } from './components/NetworkSettings';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    toast.success('Logged out successfully');
    window.location.href = '/auth';
  };

  if (!mounted || authLoading) {
    return (
      <div className="container py-8 max-w-6xl space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
           <div className="space-y-2">
             <div className="h-8 w-48 bg-muted rounded animate-pulse" />
             <div className="h-4 w-64 bg-muted rounded animate-pulse" />
           </div>
        </div>
        <LoadingGrid count={3} />
      </div>
    );
  }

  return (
    <div className="container py-8 px-6 max-w-6xl space-y-8 animate-in fade-in duration-500 relative min-h-screen">
      {/* Decorative Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60 relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
            <SettingsIcon className="w-8 h-8 text-primary shadow-glow" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground font-medium italic">Manage your account and application preferences</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="h-11 rounded-xl px-6 border-destructive/20 text-destructive hover:bg-destructive/5 font-bold text-xs tracking-wider gap-2 transition-all uppercase"
        >
          <LogOut className="w-4 h-4" /> 
          Log Out
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 rounded-2xl border border-border/40 mb-2 flex-wrap gap-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'connected', label: 'Network', icon: Globe },
            { id: 'security', label: 'Security', icon: Lock }
          ].map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="rounded-xl py-2.5 px-5 gap-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                      <User className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold tracking-tight">Profile Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Full Name</Label>
                        <Input value={user?.fullName || 'Ananay Dubey'} className="h-12 rounded-xl bg-background border-border/60 font-bold" readOnly />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Email Address</Label>
                        <Input value={user?.email || 'student@pec.edu'} className="h-12 rounded-xl bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Student ID</Label>
                        <Input value="PEC2026CS101" className="h-12 rounded-xl bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Role</Label>
                        <Input value={user?.role?.toUpperCase() || 'STUDENT'} className="h-12 rounded-xl bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-start">
                      <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide gap-2 shadow-glow hover:scale-[1.02] transition-all">
                        <RefreshCw className="w-4 h-4" /> Save Changes
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500 delay-100">
                     <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                      <Shield className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold tracking-tight">Account Actions</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
                        <h3 className="text-sm font-bold text-destructive">Sign Out</h3>
                        <p className="text-xs text-muted-foreground">Sign out of your account on this device. You will need to sign back in to access your portal.</p>
                        <Button variant="destructive" className="w-full h-10 mt-2 font-bold gap-2 rounded-lg" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-8">
              <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight">Appearance & Theme</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Color Scheme</h3>
                    <p className="text-[10px] text-muted-foreground italic font-medium mb-4">Choose your preferred lighting environment</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light Mode', icon: Sun },
                      { id: 'dark', label: 'Dark Mode', icon: Moon },
                      { id: 'system', label: 'System Theme', icon: Monitor }
                    ].map(t => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          toast.success(`${t.label} applied`);
                        }}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3",
                          theme === t.id 
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/5" 
                            : "border-border/40 hover:border-primary/20 bg-background/40 hover:bg-background/80"
                        )}
                      >
                        <t.icon className={cn("w-6 h-6", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Accent Color</h3>
                    <p className="text-[10px] text-muted-foreground italic font-medium mb-4">Personalize your application's primary color</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                      { id: 'sapphire', name: 'Sapphire', color: 'bg-blue-500' },
                      { id: 'amethyst', name: 'Amethyst', color: 'bg-purple-500' },
                      { id: 'pec-gold', name: 'PEC Gold', color: 'bg-yellow-500' }
                    ].map(acc => {
                      const isActive = document.documentElement.classList.contains(`accent-${acc.id}`) || 
                                     (acc.id === 'emerald' && !document.documentElement.className.includes('accent-'));
                      return (
                        <div 
                          key={acc.id}
                          onClick={() => {
                            const root = document.documentElement;
                            root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-pec-gold');
                            root.classList.add(`accent-${acc.id}`);
                            localStorage.setItem('accent-color', acc.id);
                            document.cookie = `accent-color=${acc.id}; path=/; max-age=31536000`;
                            toast.success(`${acc.name} theme applied`);
                          }}
                          className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all",
                            isActive ? "border-primary bg-primary/10" : "border-border/40 hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("w-full h-8 rounded-lg", acc.color)} />
                          <p className="text-[10px] font-bold mt-2 text-center uppercase tracking-wider">{acc.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
               <NotificationSettings />
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
               <PrivacySettings />
            </TabsContent>

            <TabsContent value="connected" className="mt-0">
               <NetworkSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
               <SecuritySettings />
            </TabsContent>
      </Tabs>
    </div>
  );
}
