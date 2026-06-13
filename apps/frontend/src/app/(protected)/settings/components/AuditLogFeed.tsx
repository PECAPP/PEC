import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, UserCheck, UserMinus, ShieldAlert } from 'lucide-react';

export default function AuditLogFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/security-audit?page=${currentPage}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        const roleLogs = data.filter((l: any) => l.action.includes('ROLE'));
        setLogs(roleLogs);
        setHasMore(data.length === 20); // Basic heuristic
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading security logs...</div>;
  }

  return (
    <Card className="bg-card/40 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Live Security Audit Trail
          </CardTitle>
          <p className="text-sm text-muted-foreground">Immutable log of role assignments, revocations, and permission changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 text-xs border border-border/40 rounded-md bg-background hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">Page {page}</span>
          <button 
            disabled={!hasMore} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 text-xs border border-border/40 rounded-md bg-background hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/40 rounded-md bg-muted/10">
            <ShieldAlert className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground font-medium">No recent security events.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/40 before:to-transparent">
            {logs.map((log: any, index) => {
              const isGrant = log.action === 'ASSIGN_ROLE';
              const Icon = isGrant ? UserCheck : UserMinus;
              
              return (
                <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    <Icon className={`w-4 h-4 ${isGrant ? 'text-emerald-500' : 'text-destructive'}`} />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-md border border-border/40 bg-background/50 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <Badge variant={isGrant ? 'default' : 'destructive'} className={isGrant ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'}>
                          {log.action}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium mt-2">
                        Actor: <span className="font-bold text-foreground">{log.actorId}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: <span className="text-foreground">{log.targetType} ({log.targetId})</span>
                      </p>
                      {log.after && (
                        <div className="mt-2 p-2 bg-muted/40 rounded-sm text-[10px] overflow-x-auto border border-border/20">
                          <pre>{JSON.stringify(log.after, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
