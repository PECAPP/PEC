"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageBanner } from '@pec/ui';

export default function AccessReviewPage() {
  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      // Stub for actual API endpoint
      const res = await fetch('/api/v1/roles-mgmt/delegations');
      if (res.ok) {
        const data = await res.json();
        setDelegations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunExpirationJob = async () => {
    try {
      await fetch('/api/v1/admin/dlq/replay', { method: 'POST' }); // Placeholder for trigger
      alert('Expiration job triggered (Placeholder)');
      fetchDelegations();
    } catch (e) {
      alert('Failed to trigger job');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageBanner
        title="Access Review Report"
        subtitle="Review active role delegations and trigger expiration checks"
        badgeText="Security"
        actions={
          <Button onClick={handleRunExpirationJob} variant="outline" className="bg-background/50 hover:bg-background/80 backdrop-blur-md">
            Run Expiry Check
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Active Role Delegations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : delegations.length === 0 ? (
            <p className="text-muted-foreground">No active role delegations found.</p>
          ) : (
            <div className="space-y-4">
              {delegations.map((d: any) => (
                <div key={d.id} className="p-4 border rounded-md">
                  <p><strong>Delegatee ID:</strong> {d.delegateeId}</p>
                  <p><strong>Role ID:</strong> {d.roleId}</p>
                  <p><strong>Valid Until:</strong> {new Date(d.validUntil).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
