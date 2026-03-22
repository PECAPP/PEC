import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Activity,
  Zap,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Mock data - Replace with real API calls
const systemHealth = {
  overall: 'healthy' as const,
  uptime: 99.97,
  services: [
    { name: 'API Gateway', status: 'healthy' as const, uptime: 100, responseTime: '12ms' },
    { name: 'Database', status: 'healthy' as const, uptime: 98, responseTime: '5ms' },
    { name: 'Authentication', status: 'healthy' as const, uptime: 100, responseTime: '8ms' },
    { name: 'Storage', status: 'warning' as const, uptime: 95, responseTime: '25ms' },
    { name: 'Email Service', status: 'healthy' as const, uptime: 99, responseTime: '150ms' },
    { name: 'Background Jobs', status: 'healthy' as const, uptime: 97, responseTime: '45ms' },
  ],
  resources: {
    cpu: { usage: 42, trend: 'stable' as const },
    memory: { usage: 68, trend: 'up' as const },
    storage: { usage: 73, trend: 'up' as const, total: '5TB', used: '3.65TB' },
    bandwidth: { usage: 45, trend: 'down' as const, total: '2TB', used: '900GB' },
  },
  metrics: {
    requestsPerMinute: 1240,
    activeUsers: 8450,
    errorRate: 0.12,
    avgResponseTime: 125,
  },
};

export default function SystemHealth() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Health</h1>
          <p className="text-muted-foreground">Monitor platform performance and infrastructure</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={systemHealth.overall} />
          <span className="text-sm text-muted-foreground">Last updated: Just now</span>
        </div>
      </div>

      {/* Overall Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="System Uptime"
          value={`${systemHealth.uptime}%`}
          subtext="Last 30 days"
          iconColor="text-success"
        />
        <StatCard
          icon={Zap}
          label="Requests/Min"
          value={systemHealth.metrics.requestsPerMinute.toLocaleString()}
          subtext="Current load"
          iconColor="text-accent"
        />
        <StatCard
          icon={Server}
          label="Active Users"
          value={systemHealth.metrics.activeUsers.toLocaleString()}
          subtext="Online now"
          iconColor="text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Error Rate"
          value={`${systemHealth.metrics.errorRate}%`}
          subtext="Below threshold"
          iconColor="text-success"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status */}
        <motion.div variants={item} className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Services Status</h2>
          <div className="space-y-3">
            {systemHealth.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'healthy' ? 'bg-success' :
                    service.status === 'warning' ? 'bg-warning' :
                    'bg-destructive'
                  }`} />
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Response: {service.responseTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{service.uptime}%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resource Usage */}
        <motion.div variants={item} className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Resource Usage</h2>
          <div className="space-y-6">
            <ResourceItem
              icon={Server}
              label="CPU Usage"
              value={systemHealth.resources.cpu.usage}
              trend={systemHealth.resources.cpu.trend}
            />
            <ResourceItem
              icon={Database}
              label="Memory"
              value={systemHealth.resources.memory.usage}
              trend={systemHealth.resources.memory.trend}
            />
            <ResourceItem
              icon={HardDrive}
              label="Storage"
              value={systemHealth.resources.storage.usage}
              trend={systemHealth.resources.storage.trend}
              details={`${systemHealth.resources.storage.used} / ${systemHealth.resources.storage.total}`}
            />
            <ResourceItem
              icon={Wifi}
              label="Bandwidth"
              value={systemHealth.resources.bandwidth.usage}
              trend={systemHealth.resources.bandwidth.trend}
              details={`${systemHealth.resources.bandwidth.used} / ${systemHealth.resources.bandwidth.total}`}
            />
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div variants={item} className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Activity className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{systemHealth.metrics.avgResponseTime}ms</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">99.88%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Server className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Active Servers</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div variants={item} className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          <AlertItem
            type="warning"
            message="Storage usage approaching 75% threshold"
            time="2 hours ago"
          />
          <AlertItem
            type="info"
            message="Scheduled maintenance completed successfully"
            time="6 hours ago"
          />
          <AlertItem
            type="success"
            message="All services running normally"
            time="12 hours ago"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  iconColor?: string;
}

function StatCard({ icon: Icon, label, value, subtext, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="card-elevated p-5">
      <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  );
}

interface ResourceItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  details?: string;
}

function ResourceItem({ icon: Icon, label, value, trend, details }: ResourceItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-destructive" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-success" />}
          <span className="text-sm font-medium text-foreground">{value}%</span>
        </div>
      </div>
      <Progress value={value} className="h-2 mb-1" />
      {details && <p className="text-xs text-muted-foreground">{details}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const config = {
    healthy: { label: 'All Systems Operational', variant: 'status-verified' as const, icon: CheckCircle },
    warning: { label: 'Minor Issues Detected', variant: 'status-pending' as const, icon: AlertTriangle },
    critical: { label: 'Critical Issues', variant: 'status-error' as const, icon: XCircle },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1.5 px-3 py-1.5">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Badge>
  );
}

interface AlertItemProps {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
}

function AlertItem({ type, message, time }: AlertItemProps) {
  const config = {
    success: { icon: CheckCircle, color: 'text-success' },
    warning: { icon: AlertTriangle, color: 'text-warning' },
    info: { icon: Activity, color: 'text-primary' },
    error: { icon: XCircle, color: 'text-destructive' },
  };

  const { icon: Icon, color } = config[type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
      <div className="flex-1">
        <p className="text-sm text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
