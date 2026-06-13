import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pec/ui";
import { ShieldAlert, Users, Activity } from 'lucide-react';
import RoleMatrixGrid from './RoleMatrixGrid';
import UserAssignmentUI from './UserAssignmentUI';
import AuditLogFeed from './AuditLogFeed';

export default function RolesPermissionsTab() {
  const [activeTab, setActiveTab] = useState('matrix');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="matrix" className="gap-2">
            <ShieldAlert className="w-4 h-4" /> Role Matrix & Policies
          </TabsTrigger>
          <TabsTrigger value="assignment" className="gap-2">
            <Users className="w-4 h-4" /> Identity & Access Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="w-4 h-4" /> Security Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-0">
          <RoleMatrixGrid />
        </TabsContent>

        <TabsContent value="assignment" className="mt-0">
          <UserAssignmentUI />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <AuditLogFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
