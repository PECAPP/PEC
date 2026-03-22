import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const mockOrgApprovals = [
  {
    id: '1',
    name: 'BITS Pilani - Goa Campus',
    type: 'Institute',
    location: 'Goa, India',
    email: 'admin@bits-goa.ac.in',
    submittedDate: 'Dec 28, 2024',
    documents: ['Registration Certificate', 'NAAC Accreditation'],
  },
  {
    id: '2',
    name: 'VIT University Chennai',
    type: 'University',
    location: 'Chennai, India',
    email: 'registrar@vit.ac.in',
    submittedDate: 'Dec 27, 2024',
    documents: ['UGC Recognition', 'AICTE Approval'],
  },
];

const mockAdminRequests = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@iitd.ac.in',
    organization: 'IIT Delhi',
    requestedRole: 'College Admin',
    currentRole: 'Faculty',
    submittedDate: 'Dec 29, 2024',
  },
  {
    id: '2',
    name: 'Prof. Rahul Verma',
    email: 'rahul.v@nitw.ac.in',
    organization: 'NIT Warangal',
    requestedRole: 'Placement Officer',
    currentRole: 'Faculty',
    submittedDate: 'Dec 28, 2024',
  },
  {
    id: '3',
    name: 'Dr. Sneha Patel',
    email: 'sneha.p@bits-pilani.ac.in',
    organization: 'BITS Pilani',
    requestedRole: 'Department Head',
    currentRole: 'Faculty',
    submittedDate: 'Dec 27, 2024',
  },
  {
    id: '4',
    name: 'Amit Kumar',
    email: 'amit.k@google.com',
    organization: 'Google India',
    requestedRole: 'Recruiter Admin',
    currentRole: 'Recruiter',
    submittedDate: 'Dec 26, 2024',
  },
  {
    id: '5',
    name: 'Meera Singh',
    email: 'meera.s@microsoft.com',
    organization: 'Microsoft',
    requestedRole: 'Recruiter Admin',
    currentRole: 'Recruiter',
    submittedDate: 'Dec 25, 2024',
  },
];

const mockApiRequests = [
  {
    id: '1',
    company: 'EduTech Solutions',
    purpose: 'LMS Integration',
    requestedScopes: ['read:students', 'read:courses', 'write:attendance'],
    submittedDate: 'Dec 29, 2024',
  },
  {
    id: '2',
    company: 'PaymentPro India',
    purpose: 'Fee Payment Gateway',
    requestedScopes: ['read:students', 'write:payments', 'read:finance'],
    submittedDate: 'Dec 28, 2024',
  },
  {
    id: '3',
    company: 'SkillBridge AI',
    purpose: 'Resume Analysis Service',
    requestedScopes: ['read:resumes', 'read:placements'],
    submittedDate: 'Dec 27, 2024',
  },
];

export function Approvals() {
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending requests</p>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{mockOrgApprovals.length}</p>
            <p className="text-sm text-muted-foreground">Organization Verifications</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{mockAdminRequests.length}</p>
            <p className="text-sm text-muted-foreground">Admin Role Requests</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{mockApiRequests.length}</p>
            <p className="text-sm text-muted-foreground">API Access Requests</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organizations ({mockOrgApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="admin-roles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admin Roles ({mockAdminRequests.length})
            </TabsTrigger>
            <TabsTrigger value="api-access" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Access ({mockApiRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            {mockOrgApprovals.map((org) => (
              <OrgApprovalCard key={org.id} org={org} />
            ))}
          </TabsContent>

          <TabsContent value="admin-roles" className="space-y-4">
            {mockAdminRequests.map((request) => (
              <AdminRequestCard key={request.id} request={request} />
            ))}
          </TabsContent>

          <TabsContent value="api-access" className="space-y-4">
            {mockApiRequests.map((request) => (
              <ApiRequestCard key={request.id} request={request} />
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function OrgApprovalCard({ org }: { org: typeof mockOrgApprovals[0] }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{org.name}</h3>
            <p className="text-sm text-muted-foreground">{org.type}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {org.location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {org.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Submitted {org.submittedDate}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              {org.documents.map((doc) => (
                <span key={doc} className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button variant="gradient" size="sm">
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminRequestCard({ request }: { request: typeof mockAdminRequests[0] }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-accent">{request.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{request.name}</h3>
            <p className="text-sm text-muted-foreground">{request.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{request.organization}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs">
                <span className="text-muted-foreground">{request.currentRole}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-accent font-medium">{request.requestedRole}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{request.submittedDate}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button variant="gradient" size="sm">
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiRequestCard({ request }: { request: typeof mockApiRequests[0] }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{request.company}</h3>
            <p className="text-sm text-muted-foreground">{request.purpose}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Submitted {request.submittedDate}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {request.requestedScopes.map((scope) => (
                <span key={scope} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {scope}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button variant="gradient" size="sm">
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Approvals;
