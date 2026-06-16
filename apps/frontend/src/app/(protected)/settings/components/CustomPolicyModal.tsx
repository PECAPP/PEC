import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { safeDocument } from '@/lib/ssr-safe';

interface CustomPolicyModalProps {
  onSuccess: () => void;
}

export default function CustomPolicyModal({ onSuccess }: CustomPolicyModalProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action || !subject) return;
    setLoading(true);
    try {
      const csrfToken = safeDocument.getCookie('csrf_token') ?? '';
      const res = await fetch('/api/v1/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ action, subject, description })
      });
      if (res.ok) {
        setOpen(false);
        setAction(''); setSubject(''); setDescription('');
        onSuccess();
      } else {
        alert('Failed to create policy');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-background/50 backdrop-blur-md gap-2">
          <Key className="w-4 h-4" /> Create Custom Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Policy</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject (Resource)</label>
            <Input placeholder="e.g., Course, Attendance, all" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Action (Capability)</label>
            <Input placeholder="e.g., read, write, manage" value={action} onChange={e => setAction(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Optional details..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !action || !subject}>Create Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
