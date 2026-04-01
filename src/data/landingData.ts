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
    quote: "PEC App completely transformed my academic workflow. The unified dashboard helped me track my research progress and lecture schedules in one place. It's essential for every student.",
    name: "Aman Singhania",
    designation: "B.Tech Final Year, PEC",
    src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "Academic Excellence",
  },
  {
    quote: "Tracking attendance and exam schedules in one place is a lifesaver. No more missing deadlines or checking 10 different portals. Best student tool ever.",
    name: "Riya Verma",
    designation: "3rd Year Student, PEC",
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "100% Attendance",
  },
  {
    quote: "The personalized academic insights showed me exactly where I stood in my course credits. Managed to align my electives perfectly and graduated with honors.",
    name: "Arjun Dev",
    designation: "M.Tech Graduate, PEC",
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "Honors Graduate",
  },
  {
    quote: "Managed all my course materials and institutional communications seamlessly. The dashboard is intuitive and actually fun to use. It's the ultimate campus companion.",
    name: "Kavya Sharma",
    designation: "B.Des Student, PEC",
    src: "https://images.unsplash.com/photo-1580584128409-9b5c3b3c4b9e?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "Unified Learning",
  },
];


export const faqs = [
  {
    q: "Is PEC App really free?",
    a: "Yes! PEC App is completely free for all students and faculty. We believe institutional success shouldn't come with a price tag.",
  },
  {
    q: "How do I get started?",
    a: "Simply sign up using your institutional credentials. Most students are verified and set up in under 60 seconds.",
  },
  {
    q: "Can I use it for research tracking?",
    a: "Absolutely. We have specialized modules for academic progress, research documentation, and thesis management.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use industry-standard encryption and follow full compliance protocols to keep your academic records safe.",
  },
];


export const features = [
  {
    icon: Zap,
    title: "Student-First Design",
    desc: "Experience a unified dashboard built around your academic success and personalized campus journey."
  },
  {
    icon: GraduationCap,
    title: "Institutional Sync",
    desc: "Automatically synchronize with campus resources, schedules, and digital identity systems."
  },
  {
    icon: Shield,
    title: "Secure & Verifiable",
    desc: "Industry-standard security for your academic records and institutional communications."
  }
];

export const rolesData = [
  {
    role: "Students",
    icon: Users,
    features: [
      "Smart Schedule Synchronization",
      "Digital Identity Management",
      "Institutional Resource Hub"
    ],
    bgColor: "bg-teal-900",
    borderColor: "border-teal-600"
  },
  {
    role: "Faculty",
    icon: BookOpen,
    features: [
      "Smart Attendance Management",
      "Student Mentorship Portal",
      "Digital Course Repositories"
    ],
    bgColor: "bg-green-900",
    borderColor: "border-green-600"
  },
  {
    role: "Admins",
    icon: GraduationCap,
    features: [
      "Institutional Orchestration",
      "Resource & Space Tracking",
      "Advanced Data Analytics"
    ],
    bgColor: "bg-emerald-900",
    borderColor: "border-emerald-600"
  }
];


export const stepsData = [
  {
    step: "1",
    title: "Create Your Profile",
    description: "Set up your student or faculty identity in seconds. Securely authenticated through your institutional credentials.",
    icon: Shield,
    bgColor: "bg-yellow-900",
    borderColor: "border-yellow-600",
    iconColor: "text-yellow-400",
    highlights: ["Instant authentication", "Zero paperwork", "Secure Access"]
  },
  {
    step: "2",
    title: "Sync Your Academics",
    description: "Automatically pull your course schedules, attendance logs, and academic records into one unified view.",
    icon: Target,
    bgColor: "bg-amber-900",
    borderColor: "border-amber-600",
    iconColor: "text-amber-400",
    highlights: ["Smart synchronization", "Personalized view", "Auto-grading docs"]
  },
  {
    step: "3",
    title: "Accelerate Your Growth",
    description: "Utilize AI-driven analysis, mentorship, and personalized insights to stay ahead of your campus journey.",
    icon: Zap,
    bgColor: "bg-yellow-950",
    borderColor: "border-yellow-500",
    iconColor: "text-yellow-400",
    highlights: ["Smarter Insights", "Live Performance", "Institutional Sync"]
  }
];


