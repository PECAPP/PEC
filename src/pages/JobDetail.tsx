import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  CheckCircle2,
  ArrowLeft,
  BookmarkPlus,
  ExternalLink,
  Calendar,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: 'full-time' | 'internship' | 'part-time';
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  applicants: number;
  matchScore: number;
  status: 'open' | 'applied' | 'shortlisted' | 'closed';
  tags: string[];
  aboutCompany: string;
}

const jobs: Job[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Google',
    companyLogo: 'G',
    location: 'Bangalore, India',
    type: 'full-time',
    salary: '₹25-35 LPA',
    posted: '2 days ago',
    deadline: '2024-02-15',
    description: 'Join our team to build next-generation products that impact billions of users worldwide. You will work on challenging problems in distributed systems, machine learning, and user-facing applications.',
    requirements: ['Strong DSA skills', 'Experience with distributed systems', '3+ years experience', 'B.Tech/M.Tech in CS', 'Excellent problem-solving abilities'],
    responsibilities: ['Design and develop scalable software solutions', 'Collaborate with cross-functional teams', 'Write clean, maintainable code', 'Participate in code reviews', 'Mentor junior engineers'],
    benefits: ['Competitive salary', 'Health insurance', 'Stock options', 'Flexible work hours', 'Learning budget'],
    applicants: 245,
    matchScore: 92,
    status: 'open',
    tags: ['Python', 'Go', 'Kubernetes', 'ML'],
    aboutCompany: 'Google is a multinational technology company specializing in Internet-related services and products, including online advertising technologies, a search engine, cloud computing, software, and hardware.',
  },
  {
    id: '2',
    title: 'ML Engineer Intern',
    company: 'Microsoft',
    companyLogo: 'M',
    location: 'Hyderabad, India',
    type: 'internship',
    salary: '₹80K/month',
    posted: '1 week ago',
    deadline: '2024-02-20',
    description: 'Work on cutting-edge AI/ML projects in our Azure AI team. You will have the opportunity to work with state-of-the-art models and infrastructure.',
    requirements: ['ML fundamentals', 'Python proficiency', 'Currently pursuing B.Tech/M.Tech', 'Good academic record'],
    responsibilities: ['Develop ML models', 'Conduct experiments', 'Document findings', 'Present to stakeholders'],
    benefits: ['Stipend', 'Certificate', 'PPO opportunity', 'Mentorship'],
    applicants: 189,
    matchScore: 88,
    status: 'applied',
    tags: ['Python', 'TensorFlow', 'Azure', 'NLP'],
    aboutCompany: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Amazon',
    companyLogo: 'A',
    location: 'Mumbai, India',
    type: 'full-time',
    salary: '₹18-28 LPA',
    posted: '3 days ago',
    deadline: '2024-02-18',
    description: 'Build scalable e-commerce solutions for millions of customers. Join our team to work on high-impact projects.',
    requirements: ['React/Node.js experience', 'AWS knowledge', '2+ years experience', 'Problem-solving skills'],
    responsibilities: ['Build full-stack applications', 'Optimize performance', 'Work with databases', 'Deploy to cloud'],
    benefits: ['Competitive pay', 'RSUs', 'Health benefits', 'Career growth'],
    applicants: 312,
    matchScore: 85,
    status: 'open',
    tags: ['React', 'Node.js', 'AWS', 'MongoDB'],
    aboutCompany: 'Amazon is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'Flipkart',
    companyLogo: 'F',
    location: 'Bangalore, India',
    type: 'full-time',
    salary: '₹12-18 LPA',
    posted: '5 days ago',
    deadline: '2024-02-22',
    description: 'Analyze large datasets to drive business decisions. Work with product and engineering teams.',
    requirements: ['SQL expertise', 'Python/R', 'Statistical knowledge', 'B.Tech/B.E preferred'],
    responsibilities: ['Data analysis', 'Create dashboards', 'Generate insights', 'Present findings'],
    benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Learning opportunities'],
    applicants: 156,
    matchScore: 78,
    status: 'open',
    tags: ['SQL', 'Python', 'Tableau', 'Statistics'],
    aboutCompany: 'Flipkart is an Indian e-commerce company headquartered in Bangalore, Karnataka, India.',
  },
  {
    id: '5',
    title: 'Frontend Developer Intern',
    company: 'Razorpay',
    companyLogo: 'R',
    location: 'Remote',
    type: 'internship',
    salary: '₹50K/month',
    posted: '1 day ago',
    deadline: '2024-02-10',
    description: 'Build beautiful and performant payment interfaces. Work with modern frontend technologies.',
    requirements: ['React knowledge', 'CSS/Tailwind', 'Currently enrolled in college', 'Portfolio required'],
    responsibilities: ['Build UI components', 'Write tests', 'Collaborate with designers', 'Document code'],
    benefits: ['Stipend', 'Remote work', 'Mentorship', 'PPO opportunity'],
    applicants: 98,
    matchScore: 95,
    status: 'shortlisted',
    tags: ['React', 'TypeScript', 'Tailwind', 'UI/UX'],
    aboutCompany: 'Razorpay is an Indian fintech company that provides payment solutions to businesses in India.',
  },
];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const job = jobs.find(j => j.id === id);
  
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Button variant="outline" onClick={() => navigate('/placements')} className="mt-4">
          Back to Placements
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-success/10 text-success border-success/20';
      case 'applied': return 'bg-primary/10 text-primary border-primary/20';
      case 'shortlisted': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-primary';
    return 'text-warning';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/placements')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Placements
      </Button>

      {/* Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
            {job.companyLogo}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-lg text-primary font-medium">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {job.applicants} applicants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Posted {job.posted}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className={`text-4xl font-bold ${getMatchColor(job.matchScore)}`}>
                  {job.matchScore}%
                </div>
                <p className="text-sm text-muted-foreground">Match Score</p>
                <div className="flex items-center gap-1 justify-center lg:justify-end mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(job.matchScore / 20) ? 'fill-warning text-warning' : 'text-muted'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1">
            Apply with Verified Profile
          </Button>
          
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Company Website
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Responsibilities</h2>
            <ul className="space-y-3">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Requirements</h2>
            <ul className="space-y-3">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Deadline */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Application Deadline</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{job.deadline}</p>
            <p className="text-sm text-muted-foreground mt-1">Apply before the deadline</p>
          </div>

          {/* Benefits */}
          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Benefits & Perks</h3>
            <ul className="space-y-2">
              {job.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* About Company */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">About {job.company}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{job.aboutCompany}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
