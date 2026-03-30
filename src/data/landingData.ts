import { 
  Zap, 
  Server, 
  BarChart3, 
  Shield, 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap,
  Target,
  TrendingUp,
  ClipboardCheck,
  FileText
} from "lucide-react";

export const testimonials = [
  {
    quote: "Migrated from a 15-year-old system. Within 2 months, we saved 800 hours of manual data entry. Attendance tracking now takes 10 minutes instead of 3 days.",
    name: "Dr. Rajesh Mehra",
    designation: "Dean of Admissions, PEC",
    src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "800 hrs/month",
  },
  {
    quote: "Our placement team tracked 2,000 applications in spreadsheets. Now it's automated. We matched 450 students to jobs in one season—previously took all year.",
    name: "Prof. Anita Sharma",
    designation: "Placement Officer, IIT Kanpur",
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "500+ placements/season",
  },
  {
    quote: "Fee collection used to require 3 accountants and countless follow-ups. Automated reminders + online payment gateway = 95% collection rate. Best ROI we've seen.",
    name: "Dr. Arvind Nair",
    designation: "Finance Head, IIT Bombay",
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "95% collection rate",
  },
  {
    quote: "Real-time attendance dashboards saved us 40% of time spent on compliance reports. Now admissions, finance, and academics are fully integrated.",
    name: "Mrs. Kavita Rao",
    designation: "College Principal, DTU",
    src: "https://images.unsplash.com/photo-1580584128409-9b5c3b3c4b9e?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "40% time saved",
  },
  {
    quote: "We couldn't track which students were eligible for placements. Now it's automatic—plus predictive insights on who needs extra mentoring.",
    name: "Mr. Prakash Iyer",
    designation: "Academic Coordinator, Chandigarh University",
    src: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "100% eligibility tracking",
  },
];

export const faqs = [
  {
    q: "How long does implementation typically take?",
    a: "Most institutions go live in 2-4 weeks. We provide white-glove onboarding support to ensure a smooth transition.",
  },
  {
    q: "Can you import our existing data?",
    a: "Yes! We support data import from Excel, CSV, and other ERP systems. Our team handles the migration at no extra cost.",
  },
  {
    q: "What systems can PEC integrate with?",
    a: "We support Google Workspace, Microsoft 365, Canvas LMS, and any system with REST API. Custom integrations available.",
  },
  {
    q: "Is there an API we can use?",
    a: "Yes, PEC has a comprehensive REST API with full documentation. Perfect for custom development.",
  },
  {
    q: "Is PEC GDPR compliant?",
    a: "Yes, PEC is fully GDPR and FERPA compliant. All data is encrypted at rest and in transit. We're SOC 2 Type II certified.",
  },
  {
    q: "What about data backup and recovery?",
    a: "We perform hourly backups with 30-day retention. Recovery time objective (RTO) is less than 1 hour.",
  },
];

export const features = [
  {
    icon: Zap,
    title: "Automate Everything",
    desc: "From attendance to fee collection, automate repetitive tasks and save hours every week."
  },
  {
    icon: Server,
    title: "One Platform",
    desc: "Replace scattered spreadsheets with a unified system for all your institutional data."
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Real-time dashboards and reports to make data-driven decisions instantly."
  },
  {
    icon: Shield,
    title: "Secure Access",
    desc: "Role-based permissions ensure everyone sees only what they need."
  }
];

export const rolesData = [
  {
    role: "College Administrators",
    icon: GraduationCap,
    features: [
      "Department & faculty management",
      "Fee collection tracking",
      "Admission workflows",
      "Institution-wide reports"
    ],
    bgColor: "bg-emerald-900",
    borderColor: "border-emerald-600"
  },
  {
    role: "Faculty Members",
    icon: BookOpen,
    features: [
      "Class schedules & attendance",
      "Student performance tracking",
      "Course material management",
      "Exam coordination"
    ],
    bgColor: "bg-green-900",
    borderColor: "border-green-600"
  },
  {
    role: "Students",
    icon: Users,
    features: [
      "Academic dashboard",
      "Fee payments & history",
      "Placement applications",
      "Resume builder & analyzer"
    ],
    bgColor: "bg-teal-900",
    borderColor: "border-teal-600"
  },
  {
    role: "Recruiters",
    icon: Briefcase,
    features: [
      "Job posting portal",
      "Student shortlisting",
      "Interview scheduling",
      "Hiring analytics"
    ],
    bgColor: "bg-cyan-900",
    borderColor: "border-cyan-600"
  }
];

export const stepsData = [
  {
    step: "1",
    title: "Sign Up & Verify",
    description: "Create your account in 30 seconds. Verify your institution instantly through automated authentication.",
    icon: Shield,
    bgColor: "bg-orange-900",
    borderColor: "border-orange-600",
    iconColor: "text-orange-400",
    highlights: ["Instant verification", "No paperwork", "Enterprise SSO"]
  },
  {
    step: "2",
    title: "Configure Your System",
    description: "Import student data, set up departments, and configure user roles with our intelligent setup wizard.",
    icon: Target,
    bgColor: "bg-amber-900",
    borderColor: "border-amber-600",
    iconColor: "text-amber-400",
    highlights: ["Smart data import", "Custom workflows", "Role templates"]
  },
  {
    step: "3",
    title: "Launch & Scale",
    description: "Invite your team, activate modules, and start managing operations. Support available 24/7.",
    icon: Zap,
    bgColor: "bg-red-900",
    borderColor: "border-red-600",
    iconColor: "text-red-400",
    highlights: ["One-click launch", "Live training", "Dedicated support"]
  }
];
