'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Search,
  ArrowRight,
  CheckSquare,
  Square,
  Loader2,
  Info,
  RotateCcw,
  Save,
} from 'lucide-react';
import { safeDocument } from '@/lib/ssr-safe';

interface Permission {
  id: string;
  action: string;
  subject: string;
  description?: string;
}

interface RolePermission {
  permission: Permission;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  hierarchy: number;
  isSystem: boolean;
  isSystemAdmin?: boolean;
  parentRoleId?: string | null;
  permissions: RolePermission[];
}

interface EditRolePermissionsModalProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  Role: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Permission: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  User: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Course: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Department: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Enrollment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Timetable: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CourseMaterial: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Attendance: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  AttendanceSession: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Grade: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CgpaEntry: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Examination: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  FacultyBio: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  HostelIssue: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CanteenItem: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  NightCanteenItem: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MarketplaceListing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  FeeRecord: 'bg-green-500/10 text-green-400 border-green-500/20',
  Room: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CampusMap: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  Notice: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  FeatureFlag: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  all: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ACTION_BADGE: Record<string, string> = {
  manage: 'bg-red-500/15 text-red-400',
  create: 'bg-emerald-500/15 text-emerald-400',
  read: 'bg-blue-500/15 text-blue-400',
  update: 'bg-amber-500/15 text-amber-400',
  delete: 'bg-rose-500/15 text-rose-400',
};

export default function EditRolePermissionsModal({
  role,
  open,
  onOpenChange,
  onSuccess,
}: EditRolePermissionsModalProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [originalIds, setOriginalIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* ── Fetch all available permissions ───────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    fetch('/api/v1/permissions')
      .then((r) => r.json())
      .then((data: Permission[]) => setAllPermissions(data))
      .catch(() => setError('Failed to load permissions.'))
      .finally(() => setLoading(false));
  }, [open]);

  /* ── Pre-select current permissions when role changes ──────────────────── */
  useEffect(() => {
    if (!role) return;
    const ids = new Set(role.permissions.map((rp) => rp.permission.id));
    setSelectedIds(new Set(ids));
    setOriginalIds(new Set(ids));
    setSearch('');
    setActiveSubject('All');
  }, [role, open]);

  /* ── Derived: group permissions by subject ─────────────────────────────── */
  const subjects = useMemo(() => {
    const s = new Set(allPermissions.map((p) => p.subject));
    return ['All', ...Array.from(s).sort()];
  }, [allPermissions]);

  const filtered = useMemo(() => {
    return allPermissions.filter((p) => {
      const matchSubject = activeSubject === 'All' || p.subject === activeSubject;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.action.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      return matchSubject && matchSearch;
    });
  }, [allPermissions, activeSubject, search]);

  const isDirty = useMemo(() => {
    if (selectedIds.size !== originalIds.size) return true;
    for (const id of selectedIds) if (!originalIds.has(id)) return true;
    return false;
  }, [selectedIds, originalIds]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });

  const clearAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.delete(p.id));
      return next;
    });

  const reset = () => {
    setSelectedIds(new Set(originalIds));
    setSearch('');
    setActiveSubject('All');
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    setError('');
    const csrfToken = safeDocument.getCookie('csrf_token') ?? '';
    try {
      const res = await fetch(`/api/v1/roles/${role.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ permissionIds: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to save permissions');
      }
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (!role) return null;

  const isAdmin = role.isSystemAdmin || role.name === 'college_admin';
  const selectedInView = filtered.filter((p) => selectedIds.has(p.id)).length;
  const totalInView = filtered.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-card/60 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Edit Permissions —{' '}
                  <span className="text-primary">{role.name}</span>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {role.description || 'No description'}
                  {' · '}
                  <span className="font-medium">Hierarchy {role.hierarchy}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {role.isSystem && (
                <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                  System Role
                </Badge>
              )}
              {isAdmin && (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px]">
                  Superuser
                </Badge>
              )}
            </div>
          </div>

          {/* Admin notice — fully editable */}
          {isAdmin && (
            <div className="mt-3 flex items-start gap-2 text-xs bg-blue-500/10 border border-blue-500/25 rounded-md px-3 py-2.5 text-blue-400">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>college_admin</strong> is seeded with all permissions by default.
                You can add or remove individual permissions here — changes take effect
                immediately and apply like any other role.{' '}
                <span className="opacity-70">
                  Note: removing <code className="bg-blue-500/15 px-1 py-0.5 rounded text-[10px]">manage → all</code> will restrict admin
                  to only explicitly granted permissions.
                </span>
              </span>
            </div>
          )}

          {/* Parent inheritance notice */}
          {role.parentRoleId && (
            <div className="mt-2 flex items-start gap-2 text-xs bg-blue-500/10 border border-blue-500/25 rounded-md px-3 py-2.5 text-blue-400">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                This role inherits permissions from its parent role automatically. Permissions shown
                here are <strong>role-specific</strong> overrides on top of inherited ones.
              </span>
            </div>
          )}
        </DialogHeader>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-border/40 bg-muted/20 flex-shrink-0 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, subject or description…"
              className="pl-8 h-8 text-xs bg-background/50 border-border/60"
            />
          </div>

          {/* Subject filter pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {subjects.map((s) => {
              const colorClass =
                s === 'All'
                  ? activeSubject === 'All'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background/50 border-border/60 text-muted-foreground hover:border-border'
                  : activeSubject === s
                    ? `${SUBJECT_COLORS[s] || 'bg-primary/10 text-primary border-primary/20'} border font-semibold`
                    : `${SUBJECT_COLORS[s] || 'bg-muted/30 text-muted-foreground border-border/40'} border opacity-60 hover:opacity-100`;
              return (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all whitespace-nowrap ${colorClass}`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Bulk actions & stats */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">{selectedInView}</span>/{totalInView}{' '}
              visible selected ·{' '}
              <span className="text-foreground font-medium">{selectedIds.size}</span> total
            </span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] gap-1" onClick={selectAll}>
                <CheckSquare className="w-3 h-3" /> Select all visible
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] gap-1" onClick={clearAll}>
                <Square className="w-3 h-3" /> Deselect visible
              </Button>
            </div>
          </div>
        </div>

        {/* ── Permission grid ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading permissions…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Key className="w-8 h-8 text-muted-foreground opacity-40" />
              <span className="text-sm text-muted-foreground">No permissions match your filter.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((p) => {
                const checked = selectedIds.has(p.id);
                const subjectColor = SUBJECT_COLORS[p.subject] || 'bg-muted/40 text-muted-foreground border-border/40';
                const actionColor = ACTION_BADGE[p.action] || 'bg-muted/40 text-muted-foreground';
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150 group
                      ${checked
                        ? 'bg-primary/8 border-primary/40 shadow-sm shadow-primary/10'
                        : 'bg-background/30 border-border/40 hover:border-border/70 hover:bg-muted/20'
                      }`}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${checked
                          ? 'bg-primary border-primary'
                          : 'border-border/60 group-hover:border-border bg-background/50'
                        }`}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${actionColor}`}>
                          {p.action}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${subjectColor}`}>
                          {p.subject}
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Selected glow dot */}
                    {checked && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-card/40 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <ShieldAlert className="w-3.5 h-3.5" /> {error}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={reset}
              disabled={!isDirty || saving}
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 min-w-[110px]"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save{' '}
                  <span className="ml-0.5 opacity-70 text-[10px]">
                    ({selectedIds.size})
                  </span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
