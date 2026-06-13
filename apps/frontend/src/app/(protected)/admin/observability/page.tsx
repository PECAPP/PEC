'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, Server, Database, Clock, RefreshCcw, Cpu,
  Play, Square, RotateCcw, Terminal, X, CheckCircle2,
  AlertCircle, CircleDot, Wifi, WifiOff, MemoryStick,
  Gauge, Zap, GitBranch, TrendingUp, AlertTriangle,
  BarChart2, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { api } from '@pec/api';
import { PageBanner, Button } from '@pec/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  health: string;
  uptime: string;
  cpuPercent: string;
  memoryUsage: string;
  memoryLimit: string;
  memoryPercent: string;
  ports: string;
  restartCount: number;
}

interface MetricPoint {
  time: string;
  memoryMB: number;
  heapMB: number;
  heapTotalMB: number;
  requestRate: number;
  errorRate: number;
  eventLoopLag: number;
  gcPauseMs: number;
  activeConnections: number;
  p50ms: number;
  p95ms: number;
  p99ms: number;
}

interface RabbitQueue {
  name: string;
  messages: number;
  consumers: number;
  state: string;
}

// ─── Metric helpers ───────────────────────────────────────────────────────────

function parseNum(raw: string, pattern: RegExp): number {
  const m = raw.match(pattern);
  return m ? parseFloat(m[1]) : 0;
}

function parseLabeledMetric(raw: string, metricName: string, labelFilter?: string): number {
  const lines = raw.split('\n').filter(l => l.startsWith(metricName) && !l.startsWith('#'));
  if (labelFilter) {
    const line = lines.find(l => l.includes(labelFilter));
    if (!line) return 0;
    return parseFloat(line.split(' ').pop() ?? '0') || 0;
  }
  return lines.reduce((sum, l) => sum + (parseFloat(l.split(' ').pop() ?? '0') || 0), 0);
}

function sumMetric(raw: string, metricName: string): number {
  return raw.split('\n')
    .filter(l => l.startsWith(metricName) && !l.startsWith('#'))
    .reduce((sum, l) => sum + (parseFloat(l.split(' ').pop() ?? '0') || 0), 0);
}

// ─── Color palette ────────────────────────────────────────────────────────────

const CHART_COLORS = ['#8b5cf6','#38bdf8','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16'];

// ─── Tooltip style ────────────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 6,
    fontSize: 11,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stateColor(state: string, health: string) {
  if (state === 'running') {
    if (health === 'healthy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (health === 'unhealthy') return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
    return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
  }
  if (state === 'exited') return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
  if (state === 'restarting') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
}

function StateIcon({ state, health }: { state: string; health: string }) {
  if (state === 'running') {
    if (health === 'healthy') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (health === 'unhealthy') return <AlertCircle className="w-3.5 h-3.5" />;
    return <Wifi className="w-3.5 h-3.5" />;
  }
  if (state === 'exited') return <WifiOff className="w-3.5 h-3.5" />;
  if (state === 'restarting') return <RotateCcw className="w-3.5 h-3.5 animate-spin" />;
  return <CircleDot className="w-3.5 h-3.5" />;
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, icon, children, span = 1 }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; span?: number;
}) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${span === 2 ? 'md:col-span-2' : ''} ${span === 3 ? 'md:col-span-3' : ''}`}>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}{title}
      </h2>
      {children}
    </div>
  );
}

// ─── Container Table Layout ───────────────────────────────────────────────────

function MiniBar({ value, color, width = "w-16" }: { value: number; color: string; width?: string }) {
  return (
    <div className={`h-1.5 bg-muted/60 rounded-full overflow-hidden ${width}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ContainerList({ containers, onAction, onLogs, actionInFlight }: {
  containers: ContainerInfo[];
  onAction: (id: string, action: 'start' | 'stop' | 'restart') => void;
  onLogs: (c: ContainerInfo) => void;
  actionInFlight: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs  bg-muted/5">
            <th className="px-4 py-3 font-semibold">Container</th>
            <th className="px-4 py-3 font-semibold">State</th>
            <th className="px-4 py-3 font-semibold">CPU</th>
            <th className="px-4 py-3 font-semibold">Memory</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {containers.map((container) => {
            const busy = actionInFlight === container.id;
            const running = container.state === 'running';
            const restarting = container.state === 'restarting';
            const displayName = container.name.replace(/^pec_/, '').replace(/_dev$/, '');
            const cpuVal = parseFloat(container.cpuPercent) || 0;
            const memVal = parseFloat(container.memoryPercent) || 0;

            const stateDot = running ? (container.health === 'unhealthy' ? 'bg-rose-500' : 'bg-emerald-500') : restarting ? 'bg-amber-500' : 'bg-zinc-500';
            const statePulse = running && container.health !== 'unhealthy';
            const stateLabel = container.health !== 'unknown' && container.health !== 'none' ? container.health : container.state;
            const stateTextColor = running ? (container.health === 'unhealthy' ? 'text-rose-400' : 'text-emerald-400') : restarting ? 'text-amber-400' : 'text-zinc-400';

            return (
              <tr key={container.id} className="hover:bg-muted/10 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground" title={container.name}>{displayName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]" title={container.image}>{container.image}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-2 ${stateTextColor}`}>
                    <span className="relative flex h-2 w-2">
                      {statePulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${stateDot}`} />}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${stateDot}`} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide">{stateLabel}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {running ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums w-10">{container.cpuPercent || '0%'}</span>
                      <MiniBar value={cpuVal} color={cpuVal > 80 ? '#ef4444' : cpuVal > 50 ? '#f59e0b' : '#10b981'} />
                    </div>
                  ) : <span className="text-muted-foreground/50 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {running ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums w-14">{container.memoryUsage || '0'}</span>
                      <MiniBar value={memVal} color={memVal > 80 ? '#ef4444' : memVal > 50 ? '#f59e0b' : '#8b5cf6'} width="w-20" />
                    </div>
                  ) : <span className="text-muted-foreground/50 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/80">{container.status}</span>
                    {container.restartCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold text-xs bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" />{container.restartCount}x
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button title="Start" disabled={busy || running} onClick={() => onAction(container.id, 'start')}
                      className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      {busy && actionInFlight === container.id ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button title="Stop" disabled={busy || !running} onClick={() => onAction(container.id, 'stop')}
                      className="p-1.5 rounded text-rose-400 hover:bg-rose-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <Square className="w-4 h-4" />
                    </button>
                    <button title="Restart" disabled={busy} onClick={() => onAction(container.id, 'restart')}
                      className="p-1.5 rounded text-amber-400 hover:bg-amber-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button title="View Logs" onClick={() => onLogs(container)}
                      className="p-1.5 rounded text-sky-400 hover:bg-sky-500/15 transition-colors ml-1 border border-border hover:border-sky-400/30">
                      <Terminal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Logs Drawer ──────────────────────────────────────────────────────────────

function LogsDrawer({ container, onClose }: { container: ContainerInfo | null; onClose: () => void }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const logsRef = useRef<HTMLPreElement>(null);

  const fetchLogs = useCallback(async () => {
    if (!container) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/docker/containers/${container.id}/logs?tail=200`);
      const json = await res.json();
      setLogs(json.data?.logs ?? '');
    } catch { setLogs('Failed to fetch logs.'); }
    finally { setLoading(false); }
  }, [container]);

  useEffect(() => { fetchLogs(); const t = setInterval(fetchLogs, 5000); return () => clearInterval(t); }, [fetchLogs]);
  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

  if (!container) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-border flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-zinc-900/50">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2"><Terminal className="w-4 h-4 text-sky-400" />{container.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live — refreshes every 5s</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchLogs} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <pre ref={logsRef} className="flex-1 overflow-auto p-4 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
          {loading && !logs ? 'Loading…' : logs || 'No logs available.'}
        </pre>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_POINT: MetricPoint = {
  time: '', memoryMB: 0, heapMB: 0, heapTotalMB: 0, requestRate: 0,
  errorRate: 0, eventLoopLag: 0, gcPauseMs: 0, activeConnections: 0,
  p50ms: 0, p95ms: 0, p99ms: 0,
};

export default function ObservabilityAdmin() {
  const [metrics, setMetrics] = useState('');
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [containersLoading, setContainersLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);
  const [logsTarget, setLogsTarget] = useState<ContainerInfo | null>(null);
  const [chartData, setChartData] = useState<MetricPoint[]>([]);
  const [rabbitQueues, setRabbitQueues] = useState<RabbitQueue[]>([]);
  const prevRequestsRef = useRef(0);
  const prevErrorsRef = useRef(0);
  const prevGcRef = useRef(0);

  // ── Fetch metrics ─────────────────────────────────────────────────────────

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const { data } = await api.get('/metrics', { headers: { 'Accept': 'text/plain' } });
      setMetrics(data as string);
      setLastUpdated(new Date());

      const text = data as string;
      const memMB = parseNum(text, /process_resident_memory_bytes (\d+)/) / 1024 / 1024;
      const heapMB = parseNum(text, /nodejs_heap_space_size_used_bytes\{space="new"\} (\d+)/) / 1024 / 1024;
      const heapTotalMB = sumMetric(text, 'nodejs_heap_size_total_bytes') / 1024 / 1024;
      const totalReq = sumMetric(text, 'http_requests_total');
      const totalErr = parseLabeledMetric(text, 'http_requests_total', 'status="5');
      const gcSum = sumMetric(text, 'nodejs_gc_duration_seconds_sum');
      const eventLoopLag = parseNum(text, /nodejs_eventloop_lag_seconds (\d+(?:\.\d+)?)/) * 1000;
      const activeConns = sumMetric(text, 'http_requests_in_flight') || parseNum(text, /nodejs_active_handles_total (\d+)/);

      // Latency percentiles
      const p50 = parseLabeledMetric(text, 'http_request_duration_ms', 'quantile="0.5"') ||
                  parseLabeledMetric(text, 'http_request_duration_seconds', 'quantile="0.5"') * 1000;
      const p95 = parseLabeledMetric(text, 'http_request_duration_ms', 'quantile="0.95"') ||
                  parseLabeledMetric(text, 'http_request_duration_seconds', 'quantile="0.95"') * 1000;
      const p99 = parseLabeledMetric(text, 'http_request_duration_ms', 'quantile="0.99"') ||
                  parseLabeledMetric(text, 'http_request_duration_seconds', 'quantile="0.99"') * 1000;

      const rate = Math.max(0, totalReq - prevRequestsRef.current);
      const errRate = Math.max(0, totalErr - prevErrorsRef.current);
      const gcDelta = Math.max(0, gcSum - prevGcRef.current) * 1000;
      prevRequestsRef.current = totalReq;
      prevErrorsRef.current = totalErr;
      prevGcRef.current = gcSum;

      const point: MetricPoint = {
        time: new Date().toLocaleTimeString(),
        memoryMB: +memMB.toFixed(1),
        heapMB: +heapMB.toFixed(2),
        heapTotalMB: +heapTotalMB.toFixed(1),
        requestRate: +rate.toFixed(1),
        errorRate: +errRate.toFixed(1),
        eventLoopLag: +eventLoopLag.toFixed(2),
        gcPauseMs: +gcDelta.toFixed(3),
        activeConnections: Math.round(activeConns),
        p50ms: +p50.toFixed(1),
        p95ms: +p95.toFixed(1),
        p99ms: +p99.toFixed(1),
      };
      setChartData(prev => [...prev.slice(-29), point]);
    } catch { toast.error('Failed to load metrics'); }
    finally { setMetricsLoading(false); }
  }, []);

  // ── Fetch containers ──────────────────────────────────────────────────────

  const fetchContainers = useCallback(async () => {
    setContainersLoading(true);
    try {
      const { data } = await api.get('/admin/docker/containers');
      setContainers(data?.data ?? []);
    } catch {} finally { setContainersLoading(false); }
  }, []);

  // ── Fetch RabbitMQ ────────────────────────────────────────────────────────

  const fetchRabbit = useCallback(async () => {
    try {
      const res = await fetch('/rabbitmq/api/queues/%2F', {
        headers: { 'Authorization': 'Basic ' + btoa('guest:guest') },
      });
      if (!res.ok) return;
      const data = await res.json();
      setRabbitQueues(data.slice(0, 10).map((q: any) => ({
        name: q.name,
        messages: q.messages ?? 0,
        consumers: q.consumers ?? 0,
        state: q.state ?? 'unknown',
      })));
    } catch {}
  }, []);

  // ── Container action ──────────────────────────────────────────────────────

  const handleAction = useCallback(async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionInFlight(id);
    try {
      await api.post(`/admin/docker/containers/${id}/${action}`);
      toast.success(`Container ${action}ed`);
      setTimeout(fetchContainers, 1500);
    } catch { toast.error(`Failed to ${action} container`); }
    finally { setActionInFlight(null); }
  }, [fetchContainers]);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchMetrics(); fetchContainers(); fetchRabbit();
    const m = setInterval(fetchMetrics, 10_000);
    const c = setInterval(fetchContainers, 5_000);
    const r = setInterval(fetchRabbit, 15_000);
    return () => { clearInterval(m); clearInterval(c); clearInterval(r); };
  }, [fetchMetrics, fetchContainers, fetchRabbit]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const latest = chartData[chartData.length - 1] ?? EMPTY_POINT;
  const runningCount = containers.filter(c => c.state === 'running').length;
  const stoppedCount = containers.filter(c => c.state === 'exited').length;
  const totalRestarts = containers.reduce((sum, c) => sum + (c.restartCount ?? 0), 0);

  // Per-container chart data
  const containerCpuData = containers
    .filter(c => c.state === 'running')
    .map(c => ({ name: c.name.replace('pec_', '').replace('_dev', ''), cpu: parseFloat(c.cpuPercent) || 0 }))
    .sort((a, b) => b.cpu - a.cpu);

  const containerMemData = containers
    .filter(c => c.state === 'running')
    .map(c => {
      const mbMatch = c.memoryUsage.match(/([\d.]+)\s*(MiB|MB|GiB|GB)/i);
      const mb = mbMatch ? parseFloat(mbMatch[1]) * (mbMatch[2].startsWith('G') ? 1024 : 1) : 0;
      return { name: c.name.replace('pec_', '').replace('_dev', ''), mem: +mb.toFixed(1) };
    })
    .sort((a, b) => b.mem - a.mem);

  const containerRestartData = containers
    .filter(c => c.restartCount > 0)
    .map(c => ({ name: c.name.replace('pec_', '').replace('_dev', ''), restarts: c.restartCount }));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="mb-6">
        <PageBanner
          title="System Observability"
          subtitle="Real-time infrastructure monitoring & Docker control"
          badgeText="Admin Tools"
          icon={<Activity className="w-7 h-7 text-primary" />}
          actions={
            <Button 
              onClick={() => { fetchMetrics(); fetchContainers(); fetchRabbit(); }} 
              disabled={metricsLoading}
              className="gap-2"
            >
              <RefreshCcw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} /> Refresh All
            </Button>
          }
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: <Server className="w-4 h-4" />, label: 'Resident Mem', value: `${latest.memoryMB} MB` },
          { icon: <Cpu className="w-4 h-4" />, label: 'Heap Used', value: `${latest.heapMB} MB` },
          { icon: <Database className="w-4 h-4" />, label: 'DB Health', value: 'Connected', cls: 'text-emerald-400' },
          { icon: <Clock className="w-4 h-4" />, label: 'Updated', value: lastUpdated ? lastUpdated.toLocaleTimeString() : '—', small: true },
          { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, label: 'Running', value: String(runningCount), cls: 'text-emerald-400' },
          { icon: <WifiOff className="w-4 h-4 text-zinc-400" />, label: 'Stopped', value: String(stoppedCount), cls: 'text-zinc-400' },
          { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: 'Total Restarts', value: String(totalRestarts), cls: totalRestarts > 0 ? 'text-amber-400' : 'text-foreground' },
          { icon: <Zap className="w-4 h-4 text-violet-400" />, label: 'Event Loop Lag', value: `${latest.eventLoopLag} ms`, cls: latest.eventLoopLag > 100 ? 'text-rose-400' : 'text-foreground' },
        ].map(({ icon, label, value, cls, small }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">{icon}{label}</div>
            <div className={`font-bold ${small ? 'text-sm' : 'text-xl'} ${cls ?? 'text-foreground'}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Time-series charts ─── */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /> Process Metrics (last 30 intervals)</h2>
        <div className="grid md:grid-cols-3 gap-4">

          <ChartCard title="Memory (MB)" icon={<MemoryStick className="w-4 h-4 text-violet-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="memoryMB" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={2} dot={false} name="Resident MB" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Heap: Used vs Total (MB)" icon={<Cpu className="w-4 h-4 text-sky-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="heapTotalMB" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Total" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="heapMB" stroke="#38bdf8" strokeWidth={2} dot={false} name="Used" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Event Loop Lag (ms)" icon={<Zap className="w-4 h-4 text-amber-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="eventLoopLag" stroke="#f59e0b" fill="url(#g2)" strokeWidth={2} dot={false} name="Lag ms" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="HTTP Requests / Interval" icon={<Activity className="w-4 h-4 text-emerald-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="requestRate" stroke="#10b981" fill="url(#g3)" strokeWidth={2} dot={false} name="Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="HTTP Error Rate (5xx)" icon={<AlertCircle className="w-4 h-4 text-rose-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="errorRate" stroke="#ef4444" fill="url(#g4)" strokeWidth={2} dot={false} name="5xx Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="GC Pause Duration (ms/interval)" icon={<RefreshCcw className="w-4 h-4 text-pink-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="gcPauseMs" stroke="#ec4899" fill="url(#g5)" strokeWidth={2} dot={false} name="GC ms" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Active HTTP Connections" icon={<Wifi className="w-4 h-4 text-cyan-400" />}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="activeConnections" stroke="#06b6d4" strokeWidth={2} dot={false} name="Connections" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Request Latency Percentiles (ms)" icon={<TrendingUp className="w-4 h-4 text-lime-400" />} span={2}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="p50ms" stroke="#84cc16" strokeWidth={2} dot={false} name="p50" />
                <Line type="monotone" dataKey="p95ms" stroke="#f59e0b" strokeWidth={2} dot={false} name="p95" />
                <Line type="monotone" dataKey="p99ms" stroke="#ef4444" strokeWidth={2} dot={false} name="p99" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>

      {/* ── Container stats charts ─── */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><BarChart2 className="w-4 h-4" /> Docker Container Stats</h2>
        <div className="grid md:grid-cols-3 gap-4">

          <ChartCard title="CPU % per Container" icon={<Gauge className="w-4 h-4 text-violet-400" />}>
            <ResponsiveContainer width="100%" height={Math.max(150, containerCpuData.length * 28)}>
              <BarChart data={containerCpuData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'CPU']} />
                <Bar dataKey="cpu" radius={[0, 4, 4, 0]}>
                  {containerCpuData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Memory per Container (MiB)" icon={<MemoryStick className="w-4 h-4 text-sky-400" />}>
            <ResponsiveContainer width="100%" height={Math.max(150, containerMemData.length * 28)}>
              <BarChart data={containerMemData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} MiB`, 'Memory']} />
                <Bar dataKey="mem" radius={[0, 4, 4, 0]}>
                  {containerMemData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Container Restart Counts" icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}>
            {containerRestartData.length === 0 ? (
              <div className="flex items-center justify-center h-[150px] text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" /> No restarts — all stable
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(150, containerRestartData.length * 32)}>
                <BarChart data={containerRestartData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="restarts" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Restarts" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </div>
      </div>

      {/* ── RabbitMQ Queues ─── */}
      {rabbitQueues.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><Layers className="w-4 h-4" /> RabbitMQ Queue Depths</h2>
          <div className="bg-card border border-border rounded-lg p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rabbitQueues} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="messages" fill="#8b5cf6" name="Pending Messages" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumers" fill="#38bdf8" name="Consumers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Container Control Panel ─── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <h2 className="font-bold flex items-center gap-2 text-sm">
            <Server className="w-4 h-4 text-primary" /> Docker Container Control
            <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 rounded-full font-semibold">{runningCount} running</span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {containersLoading && <RefreshCcw className="w-3 h-3 animate-spin" />}
            Auto-refreshes every 5s
          </div>
        </div>
        <div className="p-4">
          {containersLoading && containers.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <RefreshCcw className="w-5 h-5 animate-spin" /><span className="text-sm">Loading containers…</span>
            </div>
          ) : containers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No containers found. Is the Docker socket mounted in the backend?
            </div>
          ) : (
            <ContainerList
              containers={containers}
              onAction={handleAction}
              onLogs={setLogsTarget}
              actionInFlight={actionInFlight}
            />
          )}
        </div>
      </div>

      {/* ── Grafana embed ─── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2 text-sm"><Activity className="w-4 h-4 text-primary" /> Grafana — Live Metrics Explorer</h2>
          <div className="flex gap-3 items-center">
            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold  rounded-sm border border-emerald-500/20">Live</span>
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">Open Full UI ↗</a>
          </div>
        </div>
        <div className="relative w-full" style={{ height: 700 }}>
          <iframe
            src="http://localhost:3000/explore?orgId=1&left=%7B%22datasource%22:%22prometheus%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22process_resident_memory_bytes%22%7D%5D,%22range%22:%7B%22from%22:%22now-30m%22,%22to%22:%22now%22%7D%7D&kiosk"
            className="absolute inset-0 w-full h-full border-none"
            title="Grafana Dashboard"
            allowFullScreen
          />
        </div>
      </div>

      {/* ── Raw Prometheus ─── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="font-bold text-sm flex items-center gap-2"><GitBranch className="w-4 h-4 text-muted-foreground" /> Raw Prometheus Metrics</h2>
          <span className="text-xs text-muted-foreground">Scraped from /metrics every 10s</span>
        </div>
        <div className="p-4">
          {metricsLoading && !metrics ? (
            <div className="flex justify-center p-4 md:p-6"><RefreshCcw className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto max-h-72 border border-border text-foreground font-mono">
              {metrics || 'No metrics data available.'}
            </pre>
          )}
        </div>
      </div>

      <LogsDrawer container={logsTarget} onClose={() => setLogsTarget(null)} />
    </div>
  );
}
