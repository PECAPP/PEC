"use client";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox } from "@pec/ui";


import { useEffect, useState } from "react";
import { useAuth } from '@/features/auth/hooks/useAuth';
import {  buildApiUrl  } from "@pec/api";
import {  authClient  } from "@pec/api";

interface Permission {
  id: string;
  action: string;
  subject: string;
  conditions?: any;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    permission: Permission;
  }[];
}

export default function RolesManagement() {
  const { ability } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        fetch(buildApiUrl("/roles"), {
          credentials: 'include',
        }),
        fetch(buildApiUrl("/permissions"), {
          credentials: 'include',
        }),
      ]);

      if (rolesRes.ok && permsRes.ok) {
        setRoles(await rolesRes.json());
        setPermissions(await permsRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    await fetch(buildApiUrl("/roles"), {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newRoleName, description: "Custom Role" }),
    });
    setNewRoleName("");
    fetchData();
  };

  const handleTogglePermission = async (
    roleId: string,
    permissionId: string,
    checked: boolean,
  ) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    let updatedPermIds = role.permissions.map((p) => p.permission.id);
    if (checked) {
      updatedPermIds.push(permissionId);
    } else {
      updatedPermIds = updatedPermIds.filter((id) => id !== permissionId);
    }

    await fetch(buildApiUrl(`/roles/${roleId}`), {
      method: "PATCH",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        permissions: {
          set: updatedPermIds.map((id) => ({ id })),
        },
      }),
    });

    fetchData();
  };

  if (!ability?.can("manage", "Role")) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        You do not have permission to access Role Management.
      </div>
    );
  }

  if (loading) {
    return <div className="p-8">Loading Role Matrix...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Dynamically configure Attribute-Based Access Control policies.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="New role name (e.g. TA, moderator)"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreateRole}>Create Custom Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {roles.map((role) => {
          const rolePermIds = role.permissions.map((p) => p.permission.id);
          return (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="capitalize">{role.name}</CardTitle>
                <CardDescription>
                  {role.description || "Custom Role"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={rolePermIds.includes(perm.id)}
                      onCheckedChange={(checked) =>
                        handleTogglePermission(
                          role.id,
                          perm.id,
                          checked as boolean,
                        )
                      }
                      id={`${role.id}-${perm.id}`}
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor={`${role.id}-${perm.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {perm.action} {perm.subject}
                      </label>
                      {perm.conditions && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                          {JSON.stringify(perm.conditions)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
