import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Mail,
  Phone,
  Globe,
  Edit,
  Shield,
  GraduationCap,
  Briefcase,
  CreditCard,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

const mockOrgDetails = {
  id: '1',
  name: 'Indian Institute of Technology, Delhi',
  type: 'University',
  location: 'Hauz Khas, New Delhi, India - 110016',
  website: 'https://iitd.ac.in',
  phone: '+91 11 2659 1000',
  email: 'admin@iitd.ac.in',
  status: 'active',
  joinedDate: 'January 15, 2022',
  admin: {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@iitd.ac.in',
    phone: '+91 98765 43210',
    designation: 'Director of Academic Affairs',
  },
  stats: {
    totalUsers: 15420,
    students: 12850,
    faculty: 1420,
    staff: 1150,
    departments: 28,
    courses: 342,
    placedStudents: 2450,
    avgPackage: '₹18.5L',
  },
  subscription: {
    plan: 'Enterprise',
    validTill: 'December 2025',
    storage: { used: 450, total: 1000 },
    apiCalls: { used: 1200000, total: 5000000 },
  },
};

export function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/organizations')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{mockOrgDetails.name}</h1>
          <p className="text-muted-foreground">{mockOrgDetails.type}</p>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Organization Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={MapPin} label="Address" value={mockOrgDetails.location} />
              <InfoRow icon={Globe} label="Website" value={mockOrgDetails.website} isLink />
              <InfoRow icon={Mail} label="Email" value={mockOrgDetails.email} />
              <InfoRow icon={Phone} label="Phone" value={mockOrgDetails.phone} />
              <InfoRow icon={Calendar} label="Joined" value={mockOrgDetails.joinedDate} />
              <InfoRow icon={Shield} label="Status" value="Active" valueClass="text-success font-medium" />
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox icon={Users} label="Total Users" value={mockOrgDetails.stats.totalUsers.toLocaleString()} />
              <StatBox icon={GraduationCap} label="Students" value={mockOrgDetails.stats.students.toLocaleString()} />
              <StatBox icon={Users} label="Faculty" value={mockOrgDetails.stats.faculty.toLocaleString()} />
              <StatBox icon={Building2} label="Departments" value={mockOrgDetails.stats.departments.toString()} />
              <StatBox icon={Briefcase} label="Placed Students" value={mockOrgDetails.stats.placedStudents.toLocaleString()} />
              <StatBox icon={CreditCard} label="Avg Package" value={mockOrgDetails.stats.avgPackage} />
              <StatBox icon={Activity} label="Active Courses" value={mockOrgDetails.stats.courses.toString()} />
              <StatBox icon={Users} label="Staff" value={mockOrgDetails.stats.staff.toLocaleString()} />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityRow action="New batch of 450 students enrolled" time="2 hours ago" />
              <ActivityRow action="Placement drive completed - TCS" time="1 day ago" />
              <ActivityRow action="Fee collection deadline extended" time="3 days ago" />
              <ActivityRow action="New faculty member added - CSE Department" time="1 week ago" />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* College Admin */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">College Administrator</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {mockOrgDetails.admin.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{mockOrgDetails.admin.name}</p>
                <p className="text-sm text-muted-foreground">{mockOrgDetails.admin.designation}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {mockOrgDetails.admin.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {mockOrgDetails.admin.phone}
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Manage Admin Access
            </Button>
          </motion.div>

          {/* Subscription */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Subscription</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold text-accent">{mockOrgDetails.subscription.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valid Till</span>
                <span className="font-medium">{mockOrgDetails.subscription.validTill}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">{mockOrgDetails.subscription.storage.used}GB / {mockOrgDetails.subscription.storage.total}GB</span>
                </div>
                <Progress value={(mockOrgDetails.subscription.storage.used / mockOrgDetails.subscription.storage.total) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">API Calls</span>
                  <span className="font-medium">{(mockOrgDetails.subscription.apiCalls.used / 1000000).toFixed(1)}M / {mockOrgDetails.subscription.apiCalls.total / 1000000}M</span>
                </div>
                <Progress value={(mockOrgDetails.subscription.apiCalls.used / mockOrgDetails.subscription.apiCalls.total) * 100} className="h-2" />
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                View All Users
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                View Departments
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Billing History
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-destructive">
                Suspend Organization
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value, isLink, valueClass }: { icon: React.ElementType; label: string; value: string; isLink?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
            {value}
          </a>
        ) : (
          <p className={`text-sm ${valueClass || 'text-foreground'}`}>{value}</p>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 text-center">
      <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivityRow({ action, time }: { action: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <p className="text-sm text-foreground">{action}</p>
      <span className="text-xs text-muted-foreground shrink-0 ml-4">{time}</span>
    </div>
  );
}

export default OrganizationDetail;
