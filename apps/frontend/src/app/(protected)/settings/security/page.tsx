"use client";
import { AppShellSkeleton } from "@pec/ui";
import { useEffect, useState } from "react";
import { api } from "@pec/api";
import { Monitor, Smartphone, Globe, Shield, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

function parseUA(ua: string | null) {
  if (!ua) return { browser: "Unknown Device", icon: Globe };
  const isMobile = /Mobile|Android|iP(hone|od|ad)/i.test(ua);
  
  let browser = "Unknown Browser";
  if (ua.includes("Edge") || ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return {
    browser: `${browser} on ${os}`,
    icon: isMobile ? Smartphone : Monitor,
  };
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/auth/sessions");
      setSessions(response.data.sessions || []);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error("Failed to revoke session", e);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="  space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active sessions and device history.
        </p>
      </div>

      <div className="rounded-sm border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/40 flex items-center space-x-3">
          <div className="p-2 bg-primary/10 text-primary rounded-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Active Sessions</h2>
            <p className="text-sm text-muted-foreground">
              These devices are currently logged into your account.
            </p>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <AppShellSkeleton />
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active sessions found.
            </div>
          ) : (
            <div className="divide-y">
              {sessions.map((session, index) => {
                const { browser, icon: Icon } = parseUA(session.userAgent);
                const isCurrent = index === 0; // Assuming newest is first and is the current one, though realistically we might mark the active token
                
                return (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-secondary rounded-full">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-foreground">{browser}</p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          IP: {session.ipAddress || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Started {formatDistanceToNow(new Date(session.createdAt))} ago
                        </p>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        disabled={revoking === session.id}
                        className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-destructive/20 bg-transparent shadow-sm hover:bg-destructive/10 text-destructive h-9 px-4 py-2 w-full sm:w-auto"
                      >
                        {revoking === session.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Revoke Access
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
