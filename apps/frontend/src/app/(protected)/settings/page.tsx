"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Label, PageBanner } from "@pec/ui";


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
  Monitor,
  Settings as SettingsIcon
} from 'lucide-react';
import { useTheme } from "next-themes";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import api from "@pec/api";
import { LoadingGrid } from '@/components/common/AsyncState';
import { SecuritySettings } from './SecuritySettings';
import { PrivacySettings } from './components/PrivacySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { NetworkSettings } from './components/NetworkSettings';
import CollegeSettingsTab from './components/CollegeSettingsTab';
import RolesPermissionsTab from './components/RolesPermissionsTab';
import DlqManagementTab from './components/DlqManagementTab';
import { Building2, Users, ActivitySquare } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeAccent, setActiveAccent] = useState<string>('pec-gold');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentAccent = localStorage.getItem('accent-color') || 'pec-gold';
    setActiveAccent(currentAccent);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accent-color') {
        setActiveAccent(e.newValue || 'pec-gold');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-muted rounded-sm animate-pulse" />
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
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen">
      {/* Decorative Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0  opacity-[0.03]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="mb-6 relative z-10">
        <PageBanner
          title="Settings"
          subtitle="Manage your account and application preferences"
          badgeText="Preferences"
          icon={<SettingsIcon className="w-7 h-7 text-primary" />}
          actions={
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="h-11 rounded-sm px-3 md:px-6 border-destructive/20 text-destructive hover:bg-destructive/5 font-bold text-xs tracking-wider gap-2 transition-all uppercase"
            >
              <LogOut className="w-4 h-4" /> 
              Log Out
            </Button>
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="justify-start self-start h-auto p-1 bg-card rounded-md border border-border/40 shadow-sm mb-2 overflow-x-auto flex-nowrap gap-1 max-w-full [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'connected', label: 'Network', icon: Globe },
            { id: 'security', label: 'Security', icon: Lock },
            ...(user?.ability?.can('manage', 'all' as any) ? [{ id: 'college', label: 'College Config', icon: Building2 }] : []),
            ...(user?.ability?.can('manage', 'Role' as any) ? [{ id: 'roles', label: 'Roles', icon: Users }] : []),
            ...(user?.ability?.can('manage', 'all' as any) ? [{ id: 'observability', label: 'Observability', icon: ActivitySquare }] : [])
          ].map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="rounded-sm py-2.5 px-5 gap-2.5 transition-all text-xs font-bold"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                      <User className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold tracking-tight">Profile Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium  text-muted-foreground opacity-60">Full Name</Label>
                        <Input value={user?.fullName || 'Ananay Dubey'} className="h-12 rounded-sm bg-background border-border/60 font-bold" readOnly />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium  text-muted-foreground opacity-60">Email Address</Label>
                        <Input value={user?.email || 'student@pec.edu'} className="h-12 rounded-sm bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium  text-muted-foreground opacity-60">Student ID</Label>
                        <Input value="PEC2026CS101" className="h-12 rounded-sm bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium  text-muted-foreground opacity-60">Role</Label>
                        <Input value={user?.role?.toUpperCase() || 'STUDENT'} className="h-12 rounded-sm bg-muted/40 border-border/40 opacity-70" disabled />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-start">
                      <Button className="h-12 px-4 md:px-8 rounded-sm bg-primary text-primary-foreground font-bold text-sm tracking-wide gap-2 shadow-md border border-border/40 hover:scale-[1.02] transition-all">
                        <RefreshCw className="w-4 h-4" /> Save Changes
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500 delay-100">
                     <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                      <Shield className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold tracking-tight">Account Actions</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-sm border border-destructive/20 bg-destructive/5 space-y-3">
                        <h3 className="text-sm font-bold text-destructive">Sign Out</h3>
                        <p className="text-xs text-muted-foreground">Sign out of your account on this device. You will need to sign back in to access your portal.</p>
                        <Button variant="destructive" className="w-full h-10 mt-2 font-bold gap-2 rounded-sm" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-8">
              <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight">Appearance & Theme</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium  text-muted-foreground opacity-60 mb-1">Color Scheme</h3>
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
                          api.patch('/settings', { theme: t.id }).catch(err => console.error('Failed to sync theme:', err));
                        }}
                        className={cn(
                          "p-4 rounded-sm border cursor-pointer transition-all flex flex-col items-center gap-3",
                          theme === t.id 
                            ? "border-border/40 bg-primary/5 shadow-sm shadow-primary/5" 
                            : "border-border/40 hover:border-border/40 bg-background/40 hover:bg-background/80"
                        )}
                      >
                        <t.icon className={cn("w-6 h-6", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold ">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-sm font-medium  text-muted-foreground opacity-60 mb-1">Accent Color</h3>
                    <p className="text-[10px] text-muted-foreground italic font-medium mb-4">Personalize your application's primary color</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                      { id: 'sapphire', name: 'Sapphire', color: 'bg-blue-500' },
                      { id: 'amethyst', name: 'Amethyst', color: 'bg-purple-500' },
                      { id: 'pec-gold', name: 'PEC Gold', color: 'bg-yellow-500' }
                    ].map(acc => {
                      const isActive = activeAccent === acc.id;
                      return (
                        <div 
                          key={acc.id}
                          onClick={() => {
                            setActiveAccent(acc.id);
                            const root = document.documentElement;
                            root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-pec-gold');
                            root.classList.add(`accent-${acc.id}`);
                            localStorage.setItem('accent-color', acc.id);
                            document.cookie = `accent-color=${acc.id}; path=/; max-age=31536000`;
                            
                            // Also dispatch storage event manually for same-window updates if needed
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'accent-color',
                              newValue: acc.id
                            }));

                            toast.success(`${acc.name} theme applied`);
                            api.patch('/settings', { accentColor: acc.id }).catch(err => console.error('Failed to sync accent:', err));
                          }}
                          className={cn(
                            "p-4 rounded-sm border cursor-pointer transition-all",
                            isActive ? "border-border/40 bg-primary/10 shadow-sm shadow-primary/5" : "border-border/40 hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("w-full h-8 rounded-sm", acc.color)} />
                          <p className="text-sm font-medium mt-2 text-center ">{acc.name}</p>
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

            {user?.ability?.can('manage', 'all' as any) && (
              <TabsContent value="college" className="mt-0">
                <CollegeSettingsTab />
              </TabsContent>
            )}
            
            {user?.ability?.can('manage', 'Role' as any) && (
              <TabsContent value="roles" className="mt-0">
                <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Roles & Permissions</h2>
                  </div>
                  <p className="text-muted-foreground">Manage system roles and permissions.</p>
                  <RolesPermissionsTab />
                </div>
              </TabsContent>
            )}

            {user?.ability?.can('manage', 'all' as any) && (
              <TabsContent value="observability" className="mt-0">
                <div className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                    <ActivitySquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">System Observability</h2>
                  </div>
                  <p className="text-muted-foreground">Monitor system health and background queues.</p>
                  <DlqManagementTab />
                </div>
              </TabsContent>
            )}
            
          </Tabs>
        </div>
  );
}
