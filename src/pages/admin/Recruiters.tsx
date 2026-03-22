import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Users,
  MapPin,
  Briefcase,
  MoreVertical,
  CheckCircle,
  Tag,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const mockRecruiters = [
  {
    id: '1',
    company: 'Google India Pvt Ltd',
    industry: 'Technology',
    location: 'Bangalore, India',
    contactPerson: 'Priya Sharma',
    email: 'priya.sharma@google.com',
    phone: '+91 98765 12345',
    status: 'verified',
    hires: 156,
    openJobs: 5,
    partnerColleges: ['IIT Delhi', 'IIT Bombay', 'NIT Warangal', 'BITS Pilani'],
  },
  {
    id: '2',
    company: 'Microsoft Corporation',
    industry: 'Technology',
    location: 'Hyderabad, India',
    contactPerson: 'Rahul Verma',
    email: 'rahul.verma@microsoft.com',
    phone: '+91 98765 23456',
    status: 'verified',
    hires: 245,
    openJobs: 8,
    partnerColleges: ['IIT Delhi', 'NIT Trichy', 'IIT Kanpur'],
  },
  {
    id: '3',
    company: 'Amazon Development Centre',
    industry: 'E-commerce/Technology',
    location: 'Bangalore, India',
    contactPerson: 'Sneha Patel',
    email: 'sneha.patel@amazon.com',
    phone: '+91 98765 34567',
    status: 'verified',
    hires: 312,
    openJobs: 12,
    partnerColleges: ['IIT Madras', 'NIT Warangal', 'IIIT Hyderabad'],
  },
  {
    id: '4',
    company: 'Goldman Sachs',
    industry: 'Finance',
    location: 'Mumbai, India',
    contactPerson: 'Amit Kumar',
    email: 'amit.kumar@gs.com',
    phone: '+91 98765 45678',
    status: 'pending',
    hires: 89,
    openJobs: 3,
    partnerColleges: ['IIT Delhi', 'IIT Bombay'],
  },
  {
    id: '5',
    company: 'Deloitte India',
    industry: 'Consulting',
    location: 'Gurgaon, India',
    contactPerson: 'Meera Singh',
    email: 'meera.singh@deloitte.com',
    phone: '+91 98765 56789',
    status: 'verified',
    hires: 178,
    openJobs: 6,
    partnerColleges: ['IIM Ahmedabad', 'IIT Delhi', 'XLRI'],
  },
];

export function Recruiters() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecruiters = mockRecruiters.filter(rec =>
    rec.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.partnerColleges.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-foreground">External Recruiters</h1>
          <p className="text-muted-foreground">Manage recruiting companies and their college partnerships</p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Add Recruiter
        </Button>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-foreground">124</p>
          <p className="text-sm text-muted-foreground">Total Recruiters</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-success">98</p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-accent">1,250</p>
          <p className="text-sm text-muted-foreground">Total Hires (This Year)</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-2xl font-bold text-primary">89</p>
          <p className="text-sm text-muted-foreground">Active Job Postings</p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item} className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, industry, or college..."
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

      {/* Recruiters List */}
      <motion.div variants={item} className="space-y-4">
        {filteredRecruiters.map((recruiter) => (
          <RecruiterCard key={recruiter.id} recruiter={recruiter} />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface RecruiterCardProps {
  recruiter: typeof mockRecruiters[0];
}

function RecruiterCard({ recruiter }: RecruiterCardProps) {
  return (
    <div className="card-elevated p-5 hover:border-accent/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{recruiter.company}</h3>
              {recruiter.status === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
              {recruiter.status === 'pending' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  Pending Verification
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{recruiter.industry}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {recruiter.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {recruiter.hires} hires
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {recruiter.openJobs} open jobs
              </span>
            </div>

            {/* Partner Colleges Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {recruiter.partnerColleges.map((college) => (
                <Badge key={college} variant="secondary" className="text-xs">
                  {college}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">{recruiter.contactPerson}</p>
            <p className="text-xs text-muted-foreground">{recruiter.email}</p>
            <p className="text-xs text-muted-foreground">{recruiter.phone}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>View Job Postings</DropdownMenuItem>
              <DropdownMenuItem>Edit Company</DropdownMenuItem>
              <DropdownMenuItem>Manage Partnerships</DropdownMenuItem>
              {recruiter.status === 'pending' && (
                <DropdownMenuItem className="text-success">Verify Company</DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default Recruiters;
