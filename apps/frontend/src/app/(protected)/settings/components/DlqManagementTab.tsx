import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivitySquare, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DlqManagementTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState<string | null>(null);

  useEffect(() => {
    fetchDlq();
  }, []);

  const fetchDlq = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/dlq/messages?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (id: string) => {
    setReplaying(id);
    try {
      const res = await fetch('/api/v1/admin/dlq/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id })
      });
      if (res.ok) {
        setMessages(prev => prev.filter((m: any) => m.id !== id));
      } else {
        alert('Failed to replay message');
      }
    } catch (e) {
      alert('Error replaying message');
    } finally {
      setReplaying(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Dead Letter Queue...</div>;
  }

  return (
    <Card className="bg-card/40 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-destructive" /> Dead Letter Queue (DLQ)
          </CardTitle>
          <p className="text-sm text-muted-foreground">Manage and replay failed background jobs and background synchronization tasks.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchDlq} className="bg-background/50">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/40 rounded-md bg-emerald-500/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm text-emerald-600 font-medium">System Healthy</p>
            <p className="text-xs text-muted-foreground">No failed jobs in the DLQ.</p>
          </div>
        ) : (
          <div className="rounded-md border border-border/40 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Job ID</th>
                  <th className="px-4 py-3 font-medium">Queue</th>
                  <th className="px-4 py-3 font-medium">Payload & Error</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-background/30">
                {messages.map((msg: any) => (
                  <tr key={msg.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4 font-mono text-[10px] text-muted-foreground">
                      {msg.id.split('-')[0]}...
                      <div className="text-[9px] mt-1 text-foreground/50">{new Date(msg.failedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                        {msg.queueName}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 max-w-[300px]">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-destructive truncate flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {msg.errorReason || 'Unknown Error'}
                        </div>
                        <div className="text-[9px] bg-muted/40 p-1.5 rounded border border-border/20 truncate font-mono text-muted-foreground">
                          {JSON.stringify(msg.payload)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        disabled={replaying === msg.id}
                        onClick={() => handleReplay(msg.id)}
                        className="h-7 text-[10px] px-3 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {replaying === msg.id ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
                        Replay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
