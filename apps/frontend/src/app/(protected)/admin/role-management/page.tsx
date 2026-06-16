"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageBanner } from '@pec/ui';
import {
  Shield,
  ShieldCheck,
  Key,
  ArrowRight,
  Search,
  Loader2,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { safeDocument } from '@/lib/ssr-safe';

/* ── Types ─────────────────────────────────────────────────────────────── */
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

/* ── Color maps ────────────────────────────────────────────────────────── */
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

const ROLE_ACCENT: Record<string, string> = {
  college_admin: 'text-red-400 border-red-500/30 bg-red-500/8',
  faculty: 'text-blue-400 border-blue-500/30 bg-blue-500/8',
  student: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8',
};

/* ── Main page component ───────────────────────────────────────────────── */
export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // roleId being saved
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Track permission sets per role: roleId -> Set of permissionIds
  const [rolePermMap, setRolePermMap] = useState<Record<string, Set<string>>>({});
  // Track original state for dirty detection
  const [originalPermMap, setOriginalPermMap] = useState<Record<string, Set<string>>>({});

  const getCsrf = () => safeDocument.getCookie('csrf_token') ?? '';

  /* ── Fetch data ──────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/v1/roles'),
        fetch('/api/v1/permissions'),
      ]);

      if (rolesRes.ok && permsRes.ok) {
        const rolesData: Role[] = await rolesRes.json();
        const permsData: Permission[] = await permsRes.json();

        setRoles(rolesData);
        setAllPermissions(permsData);

        // Build permission maps
        const permMap: Record<string, Set<string>> = {};
        const origMap: Record<string, Set<string>> = {};
        for (const role of rolesData) {
          const ids = new Set(role.permissions.map((rp) => rp.permission.id));
          permMap[role.id] = new Set(ids);
          origMap[role.id] = new Set(ids);
        }
        setRolePermMap(permMap);
        setOriginalPermMap(origMap);
      }
    } catch (e) {
      console.error('Failed to fetch roles/permissions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Derived data ────────────────────────────────────────────────────── */
  const subjects = useMemo(() => {
    const s = new Set(allPermissions.map((p) => p.subject));
    return ['All', ...Array.from(s).sort()];
  }, [allPermissions]);

  const filteredPermissions = useMemo(() => {
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

  // Group filtered permissions by subject
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of filteredPermissions) {
      if (!groups[p.subject]) groups[p.subject] = [];
      groups[p.subject].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPermissions]);

  /* ── Toggle handler ──────────────────────────────────────────────────── */
  const togglePermission = (roleId: string, permId: string) => {
    setRolePermMap((prev) => {
      const next = { ...prev };
      const set = new Set(next[roleId]);
      if (set.has(permId)) {
        set.delete(permId);
      } else {
        set.add(permId);
      }
      next[roleId] = set;
      return next;
    });
  };

  /* ── Dirty check per role ────────────────────────────────────────────── */
  const isDirty = (roleId: string): boolean => {
    const current = rolePermMap[roleId];
    const original = originalPermMap[roleId];
    if (!current || !original) return false;
    if (current.size !== original.size) return true;
    for (const id of current) {
      if (!original.has(id)) return true;
    }
    return false;
  };

  const anyDirty = roles.some((r) => isDirty(r.id));

  /* ── Save per role ───────────────────────────────────────────────────── */
  const saveRole = async (roleId: string) => {
    setSaving(roleId);
    try {
      const res = await fetch(`/api/v1/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrf(),
        },
        body: JSON.stringify({ permissionIds: Array.from(rolePermMap[roleId]) }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Update original to match current
      setOriginalPermMap((prev) => ({
        ...prev,
        [roleId]: new Set(rolePermMap[roleId]),
      }));

      const roleName = roles.find((r) => r.id === roleId)?.name ?? roleId;
      showToast('success', `Permissions for "${roleName}" saved successfully`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save permissions');
    } finally {
      setSaving(null);
    }
  };

  /* ── Save all dirty roles ────────────────────────────────────────────── */
  const saveAll = async () => {
    const dirtyRoles = roles.filter((r) => isDirty(r.id));
    setSaving('all');
    try {
      for (const role of dirtyRoles) {
        const res = await fetch(`/api/v1/roles/${role.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': getCsrf(),
          },
          body: JSON.stringify({ permissionIds: Array.from(rolePermMap[role.id]) }),
        });
        if (!res.ok) throw new Error(`Failed to save "${role.name}": ${await res.text()}`);
      }

      // Update all originals
      setOriginalPermMap((prev) => {
        const next = { ...prev };
        for (const role of dirtyRoles) {
          next[role.id] = new Set(rolePermMap[role.id]);
        }
        return next;
      });

      showToast('success', `All ${dirtyRoles.length} role(s) saved successfully`);
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  /* ── Reset ───────────────────────────────────────────────────────────── */
  const resetRole = (roleId: string) => {
    setRolePermMap((prev) => ({
      ...prev,
      [roleId]: new Set(originalPermMap[roleId]),
    }));
  };

  const resetAll = () => {
    setRolePermMap((prev) => {
      const next = { ...prev };
      for (const roleId of Object.keys(next)) {
        next[roleId] = new Set(originalPermMap[roleId]);
      }
      return next;
    });
  };

  /* ── Toast ───────────────────────────────────────────────────────────── */
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading permission matrix…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageBanner
        title="Permission Console"
        subtitle="Manage and oversee institutional role assignments"
        badgeText="Access Control"
        actions={
          <div className="flex items-center gap-2">
            {anyDirty && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-background/50 hover:bg-background/80 backdrop-blur-md"
                  onClick={resetAll}
                  disabled={saving !== null}
                >
                  <RotateCcw className="w-4 h-4" /> Reset All
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={saveAll}
                  disabled={saving !== null}
                >
                  {saving === 'all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save All Changes
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* ── Search & Filter Toolbar ────────────────────────────────────── */}
      <Card className="bg-card/40 border-border/40">
        <CardContent className="pt-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions by action, subject, or description…"
              className="pl-9 h-9 bg-background/50 border-border/60"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s) => {
                const isActive = activeSubject === s;
                const colorClass =
                  s === 'All'
                    ? isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background/50 border-border/60 text-muted-foreground hover:border-border'
                    : isActive
                      ? `${SUBJECT_COLORS[s] || 'bg-primary/10 text-primary border-primary/20'} border font-semibold`
                      : `${SUBJECT_COLORS[s] || 'bg-muted/30 text-muted-foreground border-border/40'} border opacity-60 hover:opacity-100`;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSubject(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all whitespace-nowrap cursor-pointer ${colorClass}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filteredPermissions.length}</span> of{' '}
            <span className="text-foreground font-medium">{allPermissions.length}</span> permissions
            {activeSubject !== 'All' && (
              <span>
                {' '}in <span className="text-foreground font-medium">{activeSubject}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Permission Matrix ──────────────────────────────────────────── */}
      <Card className="bg-card/40 border-border/40 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Permission Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any cell to toggle a permission for that role. Changes are highlighted until saved.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Role headers with save/reset per role */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {roles.map((role) => {
              const dirty = isDirty(role.id);
              const accent = ROLE_ACCENT[role.name] || 'text-foreground border-border/40 bg-muted/20';
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${accent} ${dirty ? 'ring-1 ring-amber-500/40' : ''}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold text-sm">{role.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 tabular-nums">
                    {rolePermMap[role.id]?.size ?? 0}
                  </Badge>
                  {dirty && (
                    <div className="flex items-center gap-1 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <button
                        type="button"
                        onClick={() => resetRole(role.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Reset changes"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveRole(role.id)}
                        disabled={saving !== null}
                        className="text-[10px] text-primary hover:text-primary/80 transition-colors cursor-pointer disabled:opacity-50"
                        title="Save this role"
                      >
                        {saving === role.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Matrix table */}
          <div className="rounded-md border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[280px]">
                      Permission
                    </th>
                    {roles.map((role) => {
                      const accent = ROLE_ACCENT[role.name];
                      return (
                        <th
                          key={role.id}
                          className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]"
                        >
                          <span className={accent ? accent.split(' ')[0].replace('bg-', 'text-').replace('/8', '') : ''}>
                            {role.name}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {groupedPermissions.map(([subject, permissions]) => (
                    <>
                      {/* Subject group header */}
                      <tr key={`header-${subject}`} className="bg-muted/20">
                        <td
                          colSpan={1 + roles.length}
                          className="px-4 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${SUBJECT_COLORS[subject] || 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                              {subject}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Permission rows */}
                      {permissions.map((perm) => (
                        <tr
                          key={perm.id}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          {/* Permission label */}
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ACTION_BADGE[perm.action] || 'bg-muted/40 text-muted-foreground'}`}>
                                {perm.action}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="text-xs text-foreground font-medium">{perm.subject}</span>
                            </div>
                            {perm.description && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 ml-0.5 line-clamp-1">
                                {perm.description}
                              </p>
                            )}
                          </td>

                          {/* Toggle cells for each role */}
                          {roles.map((role) => {
                            const isEnabled = rolePermMap[role.id]?.has(perm.id) ?? false;
                            const wasEnabled = originalPermMap[role.id]?.has(perm.id) ?? false;
                            const changed = isEnabled !== wasEnabled;

                            return (
                              <td key={role.id} className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(role.id, perm.id)}
                                  disabled={saving !== null}
                                  className={`
                                    inline-flex items-center justify-center w-8 h-8 rounded-md border-2 transition-all duration-150 cursor-pointer
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${isEnabled
                                      ? changed
                                        ? 'bg-primary/20 border-primary shadow-sm shadow-primary/20 ring-1 ring-amber-400/50'
                                        : 'bg-primary/15 border-primary/60 hover:bg-primary/25'
                                      : changed
                                        ? 'bg-red-500/10 border-red-500/40 ring-1 ring-amber-400/50'
                                        : 'bg-background/30 border-border/40 hover:border-border/70 hover:bg-muted/20'
                                    }
                                  `}
                                  title={`${isEnabled ? 'Disable' : 'Enable'} "${perm.action} → ${perm.subject}" for ${role.name}${changed ? ' (unsaved change)' : ''}`}
                                >
                                  {isEnabled ? (
                                    <CheckCircle2 className={`w-4 h-4 ${changed ? 'text-primary animate-in zoom-in duration-200' : 'text-primary/80'}`} />
                                  ) : (
                                    <XCircle className={`w-4 h-4 ${changed ? 'text-red-400 animate-in zoom-in duration-200' : 'text-muted-foreground/30'}`} />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}

                  {filteredPermissions.length === 0 && (
                    <tr>
                      <td colSpan={1 + roles.length} className="px-4 py-12 text-center">
                        <Key className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">
                          No permissions match your search.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300
            ${toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
