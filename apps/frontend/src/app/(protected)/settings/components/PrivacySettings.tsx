import React, { useState } from 'react';
import { Button, Label } from '@pec/ui';
import { Switch } from '@pec/ui';
import { Shield, Download, Eye, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PrivacySettings() {
  const [_loading, _setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    aiDataAccess: true,
    activityStatus: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference updated successfully');
  };

  const handleDataExport = async () => {
    setExporting(true);
    toast.info('Data export job queued. You will be notified when it is ready.');
    try {
      const res = await fetch('/api/settings/data-export', { method: 'POST' });
      if (res.ok) {
        toast.success('Export process started. Check your notifications later.');
      } else {
        toast.error('Failed to start export process.');
      }
    } catch (_e) {
      toast.error('Failed to request export.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 bg-card/60 backdrop-blur-sm space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Privacy & Data Controls</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center bg-primary/10 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-sm font-bold ">Public Profile</Label>
                <p className="text-xs text-muted-foreground mt-1">Allow other PEC students to view your portfolio and marketplace listings.</p>
              </div>
            </div>
            <Switch 
              checked={settings.profileVisibility === 'public'} 
              onCheckedChange={() => setSettings(prev => ({...prev, profileVisibility: prev.profileVisibility === 'public' ? 'private' : 'public'}))} 
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center bg-primary/10 text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-sm font-bold ">AI Data Access</Label>
                <p className="text-xs text-muted-foreground mt-1">Allow the PEC AI agent to securely access your grades, attendance, and timetable for personalized assistance.</p>
              </div>
            </div>
            <Switch checked={settings.aiDataAccess} onCheckedChange={() => handleToggle('aiDataAccess')} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
             <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center bg-primary/10 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-sm font-bold ">Activity Status</Label>
                <p className="text-xs text-muted-foreground mt-1">Show when you are online in the campus chat and marketplace.</p>
              </div>
            </div>
            <Switch checked={settings.activityStatus} onCheckedChange={() => handleToggle('activityStatus')} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 bg-card/60 backdrop-blur-sm space-y-6 animate-in fade-in duration-500 delay-100">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Download className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Data Export (GDPR)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          You have the right to download a complete archive of your data stored on PEC Campus ERP, including your attendance records, grades, and fee receipts.
        </p>
        <Button 
          onClick={handleDataExport} 
          disabled={exporting}
          className="h-11 px-3 md:px-6 font-bold gap-2 text-xs "
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Processing Export...' : 'Request Data Export'}
        </Button>
      </div>
    </div>
  );
}
