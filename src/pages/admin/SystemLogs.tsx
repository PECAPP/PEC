import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
  User,
  Server,
  Database,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const mockLogs = [
  {
    id: '1',
    timestamp: '2024-12-31 14:32:15',
    level: 'info',
    category: 'auth',
    message: 'User login successful',
    details: 'User: admin@iitd.ac.in | IP: 103.25.231.45 | Device: Chrome/Windows',
    user: 'admin@iitd.ac.in',
  },
  {
    id: '2',
    timestamp: '2024-12-31 14:30:42',
    level: 'warning',
    category: 'api',
    message: 'API rate limit approaching threshold',
    details: 'Organization: NIT Warangal | Current: 850/1000 requests per minute',
    user: 'system',
  },
  {
    id: '3',
    timestamp: '2024-12-31 14:28:18',
    level: 'success',
    category: 'database',
    message: 'Database backup completed successfully',
    details: 'Full backup | Size: 245.6 GB | Duration: 42 minutes',
    user: 'system',
  },
  {
    id: '4',
    timestamp: '2024-12-31 14:25:33',
    level: 'error',
    category: 'auth',
    message: 'Failed login attempt - Account locked',
    details: 'User: john.doe@stanford.edu | Reason: 5 failed attempts | IP: 192.168.1.100',
    user: 'john.doe@stanford.edu',
  },
  {
    id: '5',
    timestamp: '2024-12-31 14:22:10',
    level: 'info',
    category: 'organization',
    message: 'New organization registration',
    details: 'Organization: MIT Manipal | Type: Institute | Admin: vikram.s@manipal.edu',
    user: 'vikram.s@manipal.edu',
  },
  {
    id: '6',
    timestamp: '2024-12-31 14:18:45',
    level: 'success',
    category: 'security',
    message: 'Security scan completed - No threats detected',
    details: 'Scan type: Full system | Duration: 15 minutes | Files scanned: 1.2M',
    user: 'system',
  },
  {
    id: '7',
    timestamp: '2024-12-31 14:15:22',
    level: 'warning',
    category: 'server',
    message: 'High memory usage detected',
    details: 'Server: prod-app-03 | Memory: 87% | Threshold: 80%',
    user: 'system',
  },
  {
    id: '8',
    timestamp: '2024-12-31 14:12:08',
    level: 'info',
    category: 'auth',
    message: 'Admin role assigned',
    details: 'User: priya.sharma@google.com | Role: Recruiter Admin | By: super.admin@uniflow.edu',
    user: 'super.admin@uniflow.edu',
  },
  {
    id: '9',
    timestamp: '2024-12-31 14:08:55',
    level: 'error',
    category: 'api',
    message: 'External API integration failed',
    details: 'Service: Payment Gateway | Error: Connection timeout | Retry: 3/3',
    user: 'system',
  },
  {
    id: '10',
    timestamp: '2024-12-31 14:05:30',
    level: 'success',
    category: 'organization',
    message: 'Organization verified',
    details: 'Organization: BITS Pilani - Goa Campus | Verified by: super.admin@uniflow.edu',
    user: 'super.admin@uniflow.edu',
  },
];

export function SystemLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Logs</h1>
            <p className="text-muted-foreground">Monitor system activities and events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">1,245</p>
            <p className="text-xs text-muted-foreground">Info logs today</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">856</p>
            <p className="text-xs text-muted-foreground">Success events</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">23</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Log Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Logs List */}
      <motion.div variants={item} className="card-elevated divide-y divide-border">
        {filteredLogs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface LogRowProps {
  log: typeof mockLogs[0];
}

function LogRow({ log }: LogRowProps) {
  const levelConfig = {
    info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
    success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const categoryIcons = {
    auth: User,
    api: Server,
    database: Database,
    server: Server,
    security: Shield,
    organization: Server,
  };

  const config = levelConfig[log.level as keyof typeof levelConfig];
  const LevelIcon = config.icon;
  const CategoryIcon = categoryIcons[log.category as keyof typeof categoryIcons] || Server;

  return (
    <div className="p-4 hover:bg-secondary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
          <LevelIcon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{log.message}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
              {log.level.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground flex items-center gap-1">
              <CategoryIcon className="w-3 h-3" />
              {log.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {log.timestamp}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {log.user}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;
