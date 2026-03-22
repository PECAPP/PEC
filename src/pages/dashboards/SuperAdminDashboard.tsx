import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Shield,
  Server,
  Activity,
  AlertCircle,
  TrendingUp,
  Database,
  Globe,
  Settings,
  ArrowUpRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import api from '@/lib/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface Organization {
  id: string;
  name: string;
  type: string;
  totalUsers: number;
  status: 'active' | 'pending' | 'suspended';
  slug?: string;
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: { total?: number } };

      const usersResponse = await api.get<ApiResponse<any[]>>('/users', {
        params: { limit: 200, offset: 0 },
      });

      const allUsers = usersResponse.data.data || [];
      const total = usersResponse.data.meta?.total ?? allUsers.length;

      setOrganizations([
        {
          id: 'platform',
          name: 'Platform',
          type: 'system',
          totalUsers: total,
          status: 'active',
        },
      ]);
      setTotalUsers(total);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOrgs: organizations.length,
    activeOrgs: organizations.filter(o => o.status === 'active').length,
    totalUsers: totalUsers,
  };

  const handleApproveOrganization = async (orgId: string) => {
    toast.info('Organization approvals are not enabled in PostgreSQL mode yet.');
  };

  const handleRejectOrganization = async (orgId: string) => {
    toast.info('Organization approvals are not enabled in PostgreSQL mode yet.');
  };

  const handleViewOrganization = (org: Organization) => {
    // Open organization dashboard in new tab with super admin access
    if (org.slug) {
      window.open(`/${org.slug}/dashboard`, '_blank');
      toast.success(`Opening ${org.name} dashboard`);
    } else {
      toast.error('Organization slug not found');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
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
          <h1 className="text-2xl font-bold text-foreground">System Overview</h1>
          <p className="text-muted-foreground">Monitor all organizations and system health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/organizations')}>
            <Building2 className="w-4 h-4" />
            View All Organizations
          </Button>
          <Button variant="gradient" onClick={() => navigate('/organizations')}>
            <Building2 className="w-4 h-4" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Organizations"
          value={stats.totalOrgs.toString()}
          subtext="Total institutions"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Organizations"
          value={stats.activeOrgs.toString()}
          subtext="Verified institutions"
          iconColor="text-success"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtext="Across all institutions"
          iconColor="text-accent"
        />
        <StatCard
          icon={Server}
          label="System Uptime"
          value="99.97%"
          subtext="Last 30 days"
          iconColor="text-success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organizations Overview */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Organizations</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/organizations')}>
                Manage All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {organizations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No organizations yet. Run the seed script to add sample data.
                </p>
              ) : (
                organizations.slice(0, 4).map((org) => (
                  <OrgRow
                    key={org.id}
                    name={org.name}
                    type={org.type.charAt(0).toUpperCase() + org.type.slice(1)}
                    users={org.totalUsers || 0}
                    status={org.status}
                    organization={org}
                    onClick={handleViewOrganization}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/logs')}>
                View Logs
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                action="New organization registered"
                details="MIT Manipal joined the platform"
                time="2 hours ago"
                type="success"
              />
              <ActivityItem
                action="Admin role assigned"
                details="John Doe → College Admin at IIT Delhi"
                time="5 hours ago"
                type="info"
              />
              <ActivityItem
                action="Database backup completed"
                details="Full system backup (245GB)"
                time="12 hours ago"
                type="success"
              />
              <ActivityItem
                action="API rate limit triggered"
                details="NIT Warangal exceeded quota temporarily"
                time="1 day ago"
                type="warning"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Health</h2>
            <div className="space-y-4">
              <HealthItem label="Database" status="healthy" value={98} />
              <HealthItem label="API Gateway" status="healthy" value={100} />
              <HealthItem label="Storage" status="warning" value={78} />
              <HealthItem label="Auth Service" status="healthy" value={100} />
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              <ApprovalItem
                title="Admin Role Requests"
                details="5 pending requests"
                count={5}
              />
              <ApprovalItem
                title="API Access Requests"
                details="3 new integrations"
                count={3}
              />
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => navigate('/admin/approvals')}>
              Review All
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resource Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">2.4TB / 5TB</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Bandwidth</span>
                  <span className="font-medium">850GB / 2TB</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Compute</span>
                  <span className="font-medium">72% avg</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
}

function StatCard({ icon: Icon, label, value, subtext, trend, trendUp, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );
}

interface OrgRowProps {
  name: string;
  type: string;
  users: number;
  status: 'active' | 'pending' | 'suspended';
  organization: Organization;
  onClick?: (org: Organization) => void;
}

function OrgRow({ name, type, users, status, organization, onClick }: OrgRowProps) {
  const statusColors = {
    active: 'status-verified',
    pending: 'status-pending',
    suspended: 'status-error',
  };

  return (
    <div 
      onClick={() => onClick?.(organization)}
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{type} · {users.toLocaleString()} users</p>
        </div>
      </div>
      <span className={`status-badge ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}

interface ActivityItemProps {
  action: string;
  details: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

function ActivityItem({ action, details, time, type }: ActivityItemProps) {
  const typeColors = {
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-primary',
    error: 'text-destructive',
  };

  const TypeIcon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Activity;

  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${typeColors[type]}`}>
        <TypeIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{action}</p>
        <p className="text-xs text-muted-foreground">{details}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}

interface HealthItemProps {
  label: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
}

function HealthItem({ label, status, value }: HealthItemProps) {
  const statusColors = {
    healthy: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-destructive'}`} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className={`text-sm font-medium ${statusColors[status]}`}>{value}%</span>
    </div>
  );
}

interface ApprovalItemProps {
  title: string;
  details: string;
  count: number;
}

function ApprovalItem({ title, details, count }: ApprovalItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{details}</p>
      </div>
      <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center justify-center">
        {count}
      </span>
    </div>
  );
}

export default SuperAdminDashboard;
