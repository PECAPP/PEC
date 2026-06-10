import React, { useState } from 'react';
import { Button, Label, Input } from '@pec/ui';
import { Switch } from '@pec/ui';
import { Bell, BookOpen, CreditCard, Users, Save } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    academic: true,
    financial: true,
    campus: true,
    inApp: true,
    email: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '07:00'
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    // API call to save to backend would go here
    toast.success('Notification preferences updated');
  };

  return (
    <div className="space-y-6">
      <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Notification Preferences</h2>
        </div>

        <div className="space-y-8">
          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Categories</h3>
            
            <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-sm text-blue-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">Academic Updates</Label>
                  <p className="text-xs text-muted-foreground mt-1">Grades posted, timetable changes, and attendance alerts.</p>
                </div>
              </div>
              <Switch checked={settings.academic} onCheckedChange={() => handleToggle('academic')} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-sm text-emerald-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">Financial Alerts</Label>
                  <p className="text-xs text-muted-foreground mt-1">Fee due dates, payment confirmations, and fine notices.</p>
                </div>
              </div>
              <Switch checked={settings.financial} onCheckedChange={() => handleToggle('financial')} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-sm text-purple-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider">Campus & Community</Label>
                  <p className="text-xs text-muted-foreground mt-1">Marketplace messages, club events, and hostel updates.</p>
                </div>
              </div>
              <Switch checked={settings.campus} onCheckedChange={() => handleToggle('campus')} />
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Delivery Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
                <Label className="text-sm font-bold">In-App / Push</Label>
                <Switch checked={settings.inApp} onCheckedChange={() => handleToggle('inApp')} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
                <Label className="text-sm font-bold">Email</Label>
                <Switch checked={settings.email} onCheckedChange={() => handleToggle('email')} />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4 pt-4 border-t border-border/40">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Quiet Hours</h3>
                  <p className="text-xs text-muted-foreground mt-1">Mute non-critical notifications during these hours.</p>
                </div>
                <Switch checked={settings.quietHours} onCheckedChange={() => handleToggle('quietHours')} />
             </div>
             
             {settings.quietHours && (
               <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase">Start Time</Label>
                   <Input type="time" name="quietStart" value={settings.quietStart} onChange={handleChange} className="h-11 rounded-sm font-mono" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase">End Time</Label>
                   <Input type="time" name="quietEnd" value={settings.quietEnd} onChange={handleChange} className="h-11 rounded-sm font-mono" />
                 </div>
               </div>
             )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} className="h-11 px-8 rounded-sm font-bold gap-2">
              <Save className="w-4 h-4" /> Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
