import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Briefcase,
  Database,
  LineChart,
  UserCheck,
  Building2,
  HelpCircle,
  Target,
  Lightbulb,
  Heart,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const coreModules = [
  {
    icon: Users,
    title: "Student Information System",
    description:
      "Centralized student profiles with academic history, documents, and real-time status tracking.",
  },
  {
    icon: Calendar,
    title: "Timetable & Scheduling",
    description:
      "Intelligent scheduling engine that auto-generates conflict-free timetables for classes and exams.",
  },
  {
    icon: CheckCircle2,
    title: "Attendance Management",
    description:
      "Digital attendance tracking with threshold alerts and automated notifications to students and parents.",
  },
  {
    icon: CreditCard,
    title: "Fee & Finance Management",
    description:
      "Complete fee structure setup, payment tracking, receipts, and financial reporting in one place.",
  },
  {
    icon: FileText,
    title: "AI Resume Analyzer",
    description:
      "Smart resume parsing with skill extraction, scoring, and QR-based verification for authenticity.",
  },
  {
    icon: Briefcase,
    title: "Placement Portal",
    description:
      "End-to-end placement management connecting students, recruiters, and placement officers seamlessly.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Save 60% Admin Time",
    description:
      "Automate repetitive tasks like attendance, fee reminders, and report generation.",
  },
  {
    icon: Database,
    title: "Unified Data Platform",
    description:
      "No more scattered spreadsheets — all your institutional data in one secure place.",
  },
  {
    icon: LineChart,
    title: "Real-time Analytics",
    description:
      "Make data-driven decisions with live dashboards and comprehensive reports.",
  },
  {
    icon: UserCheck,
    title: "Role-Based Access",
    description:
      "Secure access control for admins, faculty, students, and recruiters with tailored dashboards.",
  },
];

const roleFeatures = [
  {
    role: "College Administrators",
    icon: Building2,
    features: [
      "Department & faculty management",
      "Fee collection tracking",
      "Admission workflows",
      "Institution-wide reports",
    ],
  },
  {
    role: "Faculty Members",
    icon: GraduationCap,
    features: [
      "Class schedules & attendance",
      "Student performance tracking",
      "Course material management",
      "Exam coordination",
    ],
  },
  {
    role: "Students",
    icon: Users,
    features: [
      "Academic dashboard",
      "Fee payments & history",
      "Placement applications",
      "Resume builder & analyzer",
    ],
  },
  {
    role: "Recruiters",
    icon: Briefcase,
    features: [
      "Job posting portal",
      "Student shortlisting",
      "Interview scheduling",
      "Hiring analytics",
    ],
  },
];

const values = [
  {
    icon: Users,
    title: "Student-Centric",
    description:
      "Everything we build is designed with students and educators in mind.",
  },
  {
    icon: Target,
    title: "Innovation",
    description:
      "We continuously innovate to solve real problems in higher education.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity",
    description: "Complex systems shouldn't require complex interfaces.",
  },
  {
    icon: Heart,
    title: "Impact",
    description:
      "We measure success by the positive impact we have on institutions.",
  },
];

const faqs = [
  {
    question: "What makes PEC different from other college management systems?",
    answer:
      "PEC is built by educators and technologists who actually understand college operations. Unlike generic ERPs, we focus on the real pain points - from simplifying attendance tracking to automating fee reminders. Everything is designed to save you time, not add more complexity.",
  },
  {
    question: "How quickly can we get started?",
    answer:
      "Most colleges go live in 2-4 weeks. We handle all the heavy lifting - data migration, system setup, and training. Your team can focus on running the college while we ensure a smooth launch with zero disruption to classes or operations.",
  },
  {
    question: "Will this work with our existing tools?",
    answer:
      "Yes! PEC integrates seamlessly with popular tools you're already using - Google Classroom, payment gateways, library systems, and more. If you have a specific system, our team will build custom integrations to make everything work together.",
  },
  {
    question: "How secure is student and institutional data?",
    answer:
      "Extremely secure. We use bank-level encryption, role-based access controls, and automatic daily backups. Your data is stored in certified data centers with 99.9% uptime. We're SOC 2 Type II certified and fully GDPR compliant.",
  },
  {
    question: "What if we need help or run into issues?",
    answer:
      "Our support team is available 24/7 via chat, email, and phone. You also get access to video tutorials, detailed guides, and a community forum. Premium plans include a dedicated account manager who knows your college inside out.",
  },
  {
    question: "Can PEC grow with our institution?",
    answer:
      "Absolutely. Whether you're a small college today or planning to expand to multiple campuses, PEC scales automatically. Add more departments, students, or features anytime without worrying about performance or additional setup.",
  },
  {
    question: "Can we try it before committing?",
    answer:
      "Yes! Get a 14-day free trial with full feature access - no credit card needed. Want to see it in action first? Book a personalized demo where we'll show you exactly how PEC solves your college's specific challenges.",
  },
  {
    question: "Do you provide training for our staff and faculty?",
    answer:
      "Comprehensive training is included for everyone - admins, faculty, students, and staff. We offer live sessions, pre-recorded tutorials, step-by-step guides, and regular webinars when new features launch. Your team will feel confident from day one.",
  },
];

export function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">PEC</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/onboarding">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="container mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full text-foreground text-sm font-medium mb-6 border border-border"
          >
            <BarChart3 className="w-4 h-4" />
            Complete ERP Solution
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            style={{ fontFamily: "'Monument Extended', serif" }}
          >
            Everything Your Institution
            <span className="block text-gradient mt-2">
              Needs in One Platform
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            PEC combines student management, academics, finance, attendance,
            and placements into a unified system designed for modern educational
            institutions.
          </motion.p>
        </motion.div>
      </section>

      {/* Core Modules Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full text-foreground text-sm font-medium mb-4 border border-border">
              <Database className="w-4 h-4" />
              Core Modules
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Monument Extended', serif" }}
            >
              Powerful Features Built-In
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every module is designed to work together seamlessly, eliminating
              data silos and manual work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-foreground/5 rounded-lg flex items-center justify-center mb-4">
                  <module.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full text-foreground text-sm font-medium mb-4 border border-border">
                <Zap className="w-4 h-4" />
                Key Benefits
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: "'Monument Extended', serif" }}
              >
                Why Institutions Choose PEC
              </h2>
              <p className="text-muted-foreground mb-8">
                Built by educators and technologists who understand the challenges
                of running modern educational institutions. Here's what makes
                PEC different.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-secondary/50 rounded-2xl p-8 border border-border"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div
                    className="text-4xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "'Monument Extended', serif" }}
                  >
                    60%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Less Admin Work
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div
                    className="text-4xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "'Monument Extended', serif" }}
                  >
                    99.9%
                  </div>
                  <div className="text-sm text-muted-foreground">Uptime SLA</div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div
                    className="text-4xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "'Monument Extended', serif" }}
                  >
                    24/7
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Support Available
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div
                    className="text-4xl font-bold text-foreground mb-1"
                    style={{ fontFamily: "'Monument Extended', serif" }}
                  >
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Institutions Trust Us
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Monument Extended', serif" }}
            >
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at PEC.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all text-center"
              >
                <value.icon className="w-12 h-12 text-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full text-foreground text-sm font-medium mb-4 border border-border">
              <UserCheck className="w-4 h-4" />
              Role-Based Access
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Monument Extended', serif" }}
            >
              Tailored for Every User
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each stakeholder gets a personalized dashboard with features
              relevant to their role.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleFeatures.map((role, index) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-foreground/5 rounded-lg flex items-center justify-center mb-4">
                  <role.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-4">{role.role}</h3>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-foreground/5 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <h2
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: "'Monument Extended', serif" }}
                >
                  Enterprise-Grade Security
                </h2>
                <p className="text-muted-foreground">
                  Your data is protected with industry-leading security measures
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "End-to-end encryption",
                "Role-based access control",
                "Regular security audits",
                "GDPR compliant",
                "Daily automated backups",
                "SOC 2 Type II certified",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full text-foreground text-sm font-medium mb-4 border border-border">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Monument Extended', serif" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Got questions? We've got answers. If you can't find what you're
              looking for, feel free to reach out to our team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 PEC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default About;