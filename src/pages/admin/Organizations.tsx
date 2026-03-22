import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Users,
  MapPin,
  Calendar,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const mockOrganizations = [
  {
    id: '1',
    name: 'Indian Institute of Technology, Delhi',
    type: 'University',
    location: 'New Delhi, India',
    users: 15420,
    status: 'active' as const,
    admin: { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@iitd.ac.in' },
    joinedDate: 'Jan 2022',
  },
  {
    id: '2',
    name: 'Stanford University',
    type: 'University',
    location: 'California, USA',
    users: 12850,
    status: 'active' as const,
    admin: { name: 'Prof. Sarah Williams', email: 'sarah.w@stanford.edu' },
    joinedDate: 'Mar 2022',
  },
  {
    id: '3',
    name: 'National Institute of Technology, Warangal',
    type: 'Institute',
    location: 'Warangal, India',
    users: 8920,
    status: 'active' as const,
    admin: { name: 'Dr. Priya Sharma', email: 'priya.s@nitw.ac.in' },
    joinedDate: 'Jun 2022',
  },
  {
    id: '4',
    name: 'Delhi Technological University',
    type: 'University',
    location: 'New Delhi, India',
    users: 7650,
    status: 'pending' as const,
    admin: { name: 'Dr. Amit Verma', email: 'amit.v@dtu.ac.in' },
    joinedDate: 'Dec 2024',
  },
  {
    id: '5',
    name: 'BITS Pilani',
    type: 'Institute',
    location: 'Pilani, India',
    users: 9200,
    status: 'active' as const,
    admin: { name: 'Prof. Neha Gupta', email: 'neha.g@bits-pilani.ac.in' },
    joinedDate: 'Aug 2022',
  },
  {
    id: '6',
    name: 'MIT Manipal',
    type: 'Institute',
    location: 'Manipal, India',
    users: 6500,
    status: 'suspended' as const,
    admin: { name: 'Dr. Vikram Singh', email: 'vikram.s@manipal.edu' },
    joinedDate: 'Nov 2023',
  },
];

export function Organizations() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredOrgs = mockOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground">Manage all enrolled universities and institutions</p>
        </div>
        <Button variant="gradient" onClick={() => navigate('/admin/organizations/new')}>
          <Plus className="w-4 h-4" />
          Add Organization
        </Button>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-foreground">48</p>
          <p className="text-sm text-muted-foreground">Total Organizations</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-success">42</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-warning">4</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-destructive">2</p>
          <p className="text-sm text-muted-foreground">Suspended</p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item} className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations by name or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Organizations List */}
      <motion.div variants={item} className="space-y-4">
        {filteredOrgs.map((org) => (
          <OrgCard key={org.id} org={org} />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface OrgCardProps {
  org: typeof mockOrganizations[0];
}

function OrgCard({ org }: OrgCardProps) {
  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Active' },
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' },
    suspended: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Suspended' },
  };

  const config = statusConfig[org.status];
  const StatusIcon = config.icon;

  return (
    <div className="card-elevated p-5 hover:border-accent/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link 
                to={`/admin/organizations/${org.id}`}
                className="font-semibold text-foreground hover:text-accent transition-colors"
              >
                {org.name}
              </Link>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{org.type}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {org.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {org.users.toLocaleString()} users
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {org.joinedDate}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">{org.admin.name}</p>
            <p className="text-xs text-muted-foreground">{org.admin.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/organizations/${org.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Organization</DropdownMenuItem>
              <DropdownMenuItem>Manage Admin</DropdownMenuItem>
              {org.status === 'pending' && (
                <DropdownMenuItem className="text-success">Approve</DropdownMenuItem>
              )}
              {org.status === 'active' && (
                <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
              )}
              {org.status === 'suspended' && (
                <DropdownMenuItem className="text-success">Reactivate</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default Organizations;
