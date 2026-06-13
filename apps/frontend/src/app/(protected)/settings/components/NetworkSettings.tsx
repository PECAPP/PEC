import React, { useState, useEffect } from 'react';
import { Button, Input } from '@pec/ui';
import { Globe, Calendar, Smartphone, Copy, Check, Link2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkSettings() {
  const [copied, setCopied] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Windows PC • Chrome', location: 'Chandigarh, IN', current: true, time: 'Active now' },
    { id: '2', device: 'iPhone 13 • Safari', location: 'Chandigarh, IN', current: false, time: '2 hours ago' },
  ]);

  useEffect(() => {
    // Mock fetching ical token from API
    setIcalUrl('https://api.erp.pec.edu/calendar/sync_abc123.ics');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    toast.success('Calendar link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeAll = () => {
    setSessions(s => s.filter(x => x.current));
    toast.success('All other sessions revoked successfully');
  };

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 bg-card/60 backdrop-blur-sm space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Connected Accounts</h2>
        </div>
        <p className="text-sm text-muted-foreground">Link external accounts to enable Single Sign-On and pull data into your portfolio.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2">
                   <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Google Workspace</h4>
                  <p className="text-xs text-muted-foreground">student@pec.edu</p>
                </div>
             </div>
             <Button variant="outline" className="h-9 text-xs font-bold text-muted-foreground" disabled>Connected</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2">
                   <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">GitHub</h4>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
             </div>
             <Button className="h-9 text-xs font-bold gap-2"><Link2 className="w-3 h-3" /> Connect</Button>
          </div>
        </div>
      </div>

      {/* Calendar Sync */}
      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 bg-card/60 backdrop-blur-sm space-y-6 animate-in fade-in duration-500 delay-75">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Calendar Sync (iCal)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Subscribe to your PEC timetable and upcoming exams in Apple Calendar, Google Calendar, or Outlook.
        </p>
        <div className="flex gap-3">
          <Input value={icalUrl} readOnly className="h-11 font-mono text-xs bg-muted/50" />
          <Button onClick={handleCopy} variant="secondary" className="h-11 px-3 md:px-6 gap-2 font-bold">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Device Management */}
      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 bg-card/60 backdrop-blur-sm space-y-6 animate-in fade-in duration-500 delay-150">
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Active Sessions</h2>
          </div>
          <Button onClick={handleRevokeAll} variant="destructive" size="sm" className="h-9 font-bold text-xs gap-2">
            <Trash2 className="w-3 h-3" /> Revoke All Others
          </Button>
        </div>

        <div className="space-y-4">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-sm border border-border/40 bg-background/50">
              <div>
                <h4 className="font-bold text-sm flex items-center gap-2">
                  {s.device} 
                  {s.current && <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary ">This Device</span>}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{s.location} • {s.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
