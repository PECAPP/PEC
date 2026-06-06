"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings as SettingsIcon,
  Check
} from 'lucide-react';
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { LoadingGrid } from '@/components/common/AsyncState';

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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="profile" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8">
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
                  <div className="card-elevated p-6 bg-card/40 flex flex-col items-center gap-6 text-center">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2rem] bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20 group-hover:border-primary/50 transition-all overflow-hidden shadow-inner">
                        <User className="w-16 h-16 text-primary/30" />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground">User Profile</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profile Picture</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-8">
              <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-12">
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold tracking-tight">Appearance Settings</h2>
                </div>

                {/* Theme Mode */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Theme Mode</Label>
                    <p className="text-[10px] text-muted-foreground italic font-medium">Select your preferred system interface theme</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'light', name: 'Light', icon: Sun },
                      { id: 'dark', name: 'Dark', icon: Moon },
                      { id: 'system', name: 'System', icon: Monitor }
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setTheme(m.id)}
                        className={cn(
                          "p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 group",
                          theme === m.id
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border/40 hover:border-primary/20 bg-background/40"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm",
                          theme === m.id ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground group-hover:bg-muted"
                        )}>
                          <m.icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm tracking-tight">{m.name}</span>
                          {theme === m.id && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-6 pt-6 border-t border-border/20">
                  <div className="flex flex-col gap-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Accent Color</Label>
                    <p className="text-[10px] text-muted-foreground italic font-medium">Choose a color for interactive interface elements</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { id: 'pec-gold', name: 'PEC Gold', color: 'bg-[#F59E0B]' },
                      { id: 'emerald', name: 'Emerald', color: 'bg-[#10B981]' },
                      { id: 'sapphire', name: 'Sapphire', color: 'bg-[#3B82F6]' },
                      { id: 'amethyst', name: 'Amethyst', color: 'bg-[#8B5CF6]' }
                    ].map((acc) => {
                      const isActive = typeof window !== 'undefined' && localStorage.getItem('accent-color') === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            const root = document.documentElement;
                            root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-pec-gold');
                            root.classList.add(`accent-${acc.id}`);
                            localStorage.setItem('accent-color', acc.id);
                            toast.success(`${acc.name} theme applied`);
                            setActiveTab('appearance');
                          }}
                          className={cn(
                            "p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 group",
                            isActive 
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/5" 
                              : "border-border/40 hover:border-primary/20 bg-background/40"
                          )}
                        >
                          <div className={cn("w-full aspect-[2/1] rounded-lg shadow-inner", acc.color)} />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{acc.name}</span>
                            {isActive && <Check className="w-3 h-3 text-primary shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
               <div className="card-elevated p-12 bg-card/50 text-center italic text-muted-foreground font-medium text-sm">
                  Notification settings will be available in the next update.
               </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
