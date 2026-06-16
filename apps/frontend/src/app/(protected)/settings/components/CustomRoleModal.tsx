import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { safeDocument } from '@/lib/ssr-safe';

interface CustomRoleModalProps {
  onSuccess: () => void;
}

export default function CustomRoleModal({ onSuccess }: CustomRoleModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hierarchy, setHierarchy] = useState(10);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchPermissions();
  }, [open]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/v1/permissions');
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const csrfToken = safeDocument.getCookie('csrf_token') ?? '';
      const res = await fetch('/api/v1/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ 
          name, 
          description, 
          hierarchy, 
          permissionIds: selectedPermissionIds 
        })
      });
      if (res.ok) {
        setOpen(false);
        setName(''); setDescription(''); setHierarchy(10); setSelectedPermissionIds([]);
        onSuccess();
      } else {
        alert('Failed to create role');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <ShieldPlus className="w-4 h-4" /> Create Custom Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Role</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Name (Identifier)</label>
            <Input placeholder="e.g., guest_lecturer" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="What is this role for?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hierarchy Level</label>
            <Input type="number" value={hierarchy} onChange={e => setHierarchy(parseInt(e.target.value))} />
            <p className="text-[10px] text-muted-foreground">Higher numbers mean higher priority in conflict resolution.</p>
          </div>
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Map Policies (Permissions)</label>
            <div className="grid grid-cols-2 gap-2 border border-border/40 p-4 rounded-md bg-muted/20 max-h-[250px] overflow-y-auto">
              {permissions.map((p: any) => (
                <label key={p.id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-sm">
                  <input 
                    type="checkbox" 
                    className="mt-1"
                    checked={selectedPermissionIds.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                  />
                  <div>
                    <div className="font-bold">{p.action} <span className="text-muted-foreground font-normal">on</span> {p.subject}</div>
                    {p.description && <div className="text-[10px] text-muted-foreground">{p.description}</div>}
                  </div>
                </label>
              ))}
              {permissions.length === 0 && <p className="text-xs text-muted-foreground col-span-2">No policies found.</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !name}>Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
