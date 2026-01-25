import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  Briefcase,
  Shield,
  BarChart3,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Zap,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Mail,
  HelpCircle,
  Code2,
  Cpu,
  Server,
  Cloud,
  ChevronDown,
  X,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Building2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import ThemeToggler from "@/components/ThemeToggler";
import { LandingColorTheme } from "@/components/LandingColorTheme";
import React, { useRef, useEffect, useState } from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import GradualBlur from "@/components/ui/GradualBlur";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DemoDashboard from './DemoDashboard';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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

const testimonials = [
  {
    quote:
      "Migrated from a 15-year-old system. Within 2 months, we saved 800 hours of manual data entry. Attendance tracking now takes 10 minutes instead of 3 days.",
    name: "Dr. Rajesh Mehra",
    designation: "Dean of Admissions, PEC",
    src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "800 hrs/month",
  },
  {
    quote:
      "Our placement team tracked 2,000 applications in spreadsheets. Now it's automated. We matched 450 students to jobs in one season—previously took all year.",
    name: "Prof. Anita Sharma",
    designation: "Placement Officer, IIT Kanpur",
    src: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "500+ placements/season",
  },
  {
    quote:
      "Fee collection used to require 3 accountants and countless follow-ups. Automated reminders + online payment gateway = 95% collection rate. Best ROI we've seen.",
    name: "Dr. Arvind Nair",
    designation: "Finance Head, IIT Bombay",
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "95% collection rate",
  },
  {
    quote:
      "Real-time attendance dashboards saved us 40% of time spent on compliance reports. Now admissions, finance, and academics are fully integrated.",
    name: "Mrs. Kavita Rao",
    designation: "College Principal, DTU",
    src: "https://images.unsplash.com/photo-1580584128409-9b5c3b3c4b9e?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "40% time saved",
  },
  {
    quote:
      "We couldn't track which students were eligible for placements. Now it's automatic—plus predictive insights on who needs extra mentoring.",
    name: "Mr. Prakash Iyer",
    designation: "Academic Coordinator, Chandigarh University",
    src: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=3540&auto=format&fit=crop",
    rating: 5,
    savedHours: "100% eligibility tracking",
  },
];

// FAQ Accordion Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card/50 border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-300"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group"
        aria-expanded={isOpen}
        aria-label={`FAQ: ${question}`}
      >
        <span className="font-semibold text-foreground group-hover:text-accent transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-accent" />
        </motion.div>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-t border-border"
      >
        <p className="p-6 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Animated Counter Component
function AnimatedCounter({
  end,
  duration = 2,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60); // 60 frames per second

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span className="font-bold text-accent group-hover:text-primary transition-colors group-hover:scale-110">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent/40 rounded-full blur-sm"
          animate={{
            x: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
            y: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);


  // GSAP Scroll Animations
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Magnetic button effect
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    magneticButtons.forEach((button) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = (button as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      };

      button.addEventListener('mousemove', handleMouseMove as EventListener);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mousemove', handleMouseMove as EventListener);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Animated Meshy Gradient Background - Full Page */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base gradient background - theme aware */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 via-background to-primary/3" />
        
        {/* Mesh Gradient Blobs - Subtle and elegant, theme-aware */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent rounded-full blur-3xl opacity-10 dark:opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl opacity-8 dark:opacity-18"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-accent rounded-full blur-3xl opacity-12 dark:opacity-25"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-primary rounded-full blur-3xl opacity-10 dark:opacity-20"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <span className="text-xl font-bold text-foreground">
                  OmniFlow
                </span>
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it Works", "Testimonials"].map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="text-sm font-semibold text-foreground/90 hover:text-foreground transition-all duration-300 relative group"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <LandingColorTheme />
              <ThemeToggler />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full hover:bg-accent/10 transition-all duration-300"
                aria-label="Sign in to your account"
              >
                <Link to="/onboarding">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300"
                aria-label="Get started with free trial"
              >
                <Link to="/onboarding">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with MacBook Scroll */}
      <section
        ref={heroRef}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Hero Local Gradient Background */}
        <div className="absolute inset-0 -z-0 overflow-hidden">
          {/* Grid Background with Mask */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black_90%,transparent_100%)]" />
          
          {/* Large animated blob 1 - Top Left */}
          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -60, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-accent rounded-full blur-3xl opacity-40"
          />
          
          {/* Large animated blob 2 - Bottom Right */}
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 80, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-primary rounded-full blur-3xl opacity-35"
          />
          
          {/* Center accent blob */}
          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent rounded-full blur-3xl opacity-30"
          />
        </div>

        {/* Hero Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto text-center relative z-10 w-full mb-20"
        >
          {/* Main Heading */}
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mt-16 max-w-4xl mx-auto mb-8"
            style={{ fontFamily: "'Monument Extended', serif", fontWeight: 900 }}
          >
            Powerful Dashboard,{" "}
            <span className="text-accent">Beautifully Designed</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto mb-12"
          >
            Manage everything from one intuitive interface. Built for modern educational institutions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              size="lg"
              asChild
              className="magnetic-btn group rounded-full bg-accent hover:bg-accent/90 text-white dark:text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base"
              aria-label="Start your free trial of OmniFlow"
            >
              <Link to="/onboarding" className="flex items-center gap-3">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="magnetic-btn group rounded-full border-2 border-foreground/20 hover:border-accent hover:bg-accent/10 transition-all duration-300 px-8 py-6 text-base font-semibold text-foreground"
              aria-label="Apply to onboard your institution"
            >
              <Link to="/apply-institution" className="flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                Apply as Institution
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            scale: useTransform(scrollYProgress, [0, 0.3], [1.15, 0.75]),
            opacity: useTransform(scrollYProgress, [0, 0.3], [1, 0.7]),
          }}
          className="mt-40 w-full overflow-x-auto"
        >
          <div className="min-w-[1440px] mx-auto max-w-7xl">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-xl overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-lg z-10">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <style>{`
                iframe {
                  scrollbar-width: none;
                }
                iframe::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="rounded-xl w-full h-[800px] overflow-hidden border border-border/30 bg-background">
                <DemoDashboard />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-card/100 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof - Client Logos & Recently Adopted */}
      {/* Integrations - Light Accent BG */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5 dark:bg-accent/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Trusted by Leading Institutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From tier-1 universities to emerging colleges, institutions worldwide rely on OmniFlow
            </p>
          </motion.div>

          {/* Infinite Scrolling Marquee */}
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-container:hover .marquee-content {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="marquee-container py-4">
              <div className="marquee-content flex gap-12 animate-[marquee_30s_linear_infinite]">
                {/* First set of logos */}
                {[
                  { name: "PEC", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/PEC_LOGO_EN.png?20241031120621" },
                  { name: "IIT Kanpur", logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/IIT_Kanpur_Logo.svg" },
                  { name: "IIT Bombay", logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg" },
                  { name: "DTU", logo: "https://upload.wikimedia.org/wikipedia/en/b/b5/DTU%2C_Delhi_official_logo.png" },
                  { name: "Chandigarh University", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Chandigarh_University_Seal.png" },
                  { name: "CSJMU", logo: "https://upload.wikimedia.org/wikipedia/en/5/5a/Chhatrapati_Shahu_Ji_Maharaj_University_logo.png" },
                  { name: "AIIMS Delhi", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/85/All_India_Institute_of_Medical_Sciences%2C_Delhi.svg/960px-All_India_Institute_of_Medical_Sciences%2C_Delhi.svg.png" },
                ].map((client, idx) => (
                  <div
                    key={`first-${idx}`}
                    className="flex-shrink-0 w-40 h-32 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center p-6 hover:border-accent/40 dark:hover:bg-white transition-all duration-300 group"
                  >
                    <div className="text-center w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <img 
                          src={client.logo} 
                          alt={`${client.name} logo`}
                          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:group-hover:invert-0 dark:mix-blend-screen dark:group-hover:mix-blend-normal transition-all duration-300"
                        />
                      </div>
                      <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground dark:group-hover:text-black transition-colors">
                        {client.name}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate set for seamless loop */}
                {[
                  { name: "PEC", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/PEC_LOGO_EN.png?20241031120621" },
                  { name: "IIT Kanpur", logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/IIT_Kanpur_Logo.svg" },
                  { name: "IIT Bombay", logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg" },
                  { name: "DTU", logo: "https://upload.wikimedia.org/wikipedia/en/b/b5/DTU%2C_Delhi_official_logo.png" },
                  { name: "Chandigarh University", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Chandigarh_University_Seal.png" },
                  { name: "CSJMU", logo: "https://upload.wikimedia.org/wikipedia/en/5/5a/Chhatrapati_Shahu_Ji_Maharaj_University_logo.png" },
                  { name: "AIIMS Delhi", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/85/All_India_Institute_of_Medical_Sciences%2C_Delhi.svg/960px-All_India_Institute_of_Medical_Sciences%2C_Delhi.svg.png" },
                ].map((client, idx) => (
                  <div
                    key={`second-${idx}`}
                    className="flex-shrink-0 w-40 h-32 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center p-6 hover:border-accent/40 dark:hover:bg-white transition-all duration-300 group"
                  >
                    <div className="text-center w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <img 
                          src={client.logo} 
                          alt={`${client.name} logo`}
                          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:group-hover:invert-0 dark:mix-blend-screen dark:group-hover:mix-blend-normal transition-all duration-300"
                        />
                      </div>
                      <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground dark:group-hover:text-black transition-colors">
                        {client.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section - Minimal Design */}
      {/* Why OmniFlow - Light Accent BG */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-accent/5 dark:bg-accent/10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Why{" "}
              <span className="text-accent">OmniFlow</span>
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              The all-in-one platform trusted by leading institutions
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[
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
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl border border-border hover:border-accent/50 bg-card hover:bg-accent/5 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:scale-105 transition-all">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid - Normal BG */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
              <span className="text-gradient">
                Manage Education
              </span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              From admissions to placements, our platform covers every aspect of
              institutional management with cutting-edge technology.
            </p>
          </motion.div>

          <div className="relative max-w-7xl mx-auto w-full">
            {/* Responsive Bento Grid - Uniform on mobile, 2 cols on tablet, full grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(140px,auto)]">
              
              {/* Student Information System - Large horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => navigate('/profile')}
                className="col-span-1 sm:col-span-2 md:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative z-10">
                  <Users className="w-10 h-10 text-white/90 mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Student Information System
                  </h2>
                  <p className="text-sm text-white/90">
                    Comprehensive student profiles with academic history, documents, and real-time attendance tracking.
                  </p>
                </div>
              </motion.div>

              {/* Academic Management - Tall vertical */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate('/courses')}
                className="col-span-1 sm:col-span-2 md:col-span-2 row-span-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <BookOpen className="w-10 h-10 text-white/90" />
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    Academic Management
                  </h3>
                  <p className="text-sm text-white/90">
                    Complete academic core with catalog, scheduling, curriculum planning and examination management.
                  </p>
                </div>
              </motion.div>

              {/* Attendance Tracking - Medium square */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/attendance')}
                className="col-span-1 row-span-1 md:row-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer"
              >
                <ClipboardCheck className="w-9 h-9 text-white/90" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Attendance Tracking
                  </h3>
                  <p className="text-sm text-white/90">
                    Biometric & QR-based with alerts
                  </p>
                </div>
              </motion.div>

              {/* Placements - Small compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/placements')}
                className="col-span-1 row-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 cursor-pointer"
              >
                <Briefcase className="w-8 h-8 text-white/80" />
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Placements
                  </h3>
                  <p className="text-xs text-white/80">AI Resume Analyzer</p>
                </div>
              </motion.div>

              {/* Examinations & Grades - Wide horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate('/examinations')}
                className="col-span-1 row-span-1 md:row-span-2 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-300 cursor-pointer"
              >
                <BarChart3 className="w-10 h-10 text-white/80" />
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    Examinations & Grades
                  </h3>
                  <p className="text-sm text-white/90">
                    Gradebook management, GPA calculations, and secure transcript generation with automated workflows.
                  </p>
                </div>
              </motion.div>

              {/* Finance Management - Medium square */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate('/finance')}
                className="col-span-1 row-span-1 md:row-span-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 cursor-pointer"
              >
                <svg className="w-9 h-9 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Finance
                  </h3>
                  <p className="text-xs text-white/90">
                    Fee collection & payment gateway
                  </p>
                </div>
              </motion.div>

              {/* Resume Builder - Shortened to 2 rows */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate('/resume-builder')}
                className="col-span-1 row-span-1 md:row-span-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer"
              >
                <FileText className="w-9 h-9 text-white/80" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    Resume Builder
                  </h3>
                  <p className="text-xs text-white/90">
                    Auto-generate verified resumes with QR codes
                  </p>
                </div>
              </motion.div>

              {/* Analytics & Reports - Small compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                onClick={() => navigate('/dashboard')}
                className="col-span-1 md:col-span-1 row-span-1 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 cursor-pointer"
              >
                <TrendingUp className="w-8 h-8 text-white/80" />
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Dashboard
                  </h3>
                  <p className="text-xs text-white/80">Real-time insights</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access - Light Accent BG */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative bg-accent/5 dark:bg-accent/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm mb-6">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Role-Based Access</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Tailored for{" "}
              <span className="text-gradient">
                Every User
              </span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Each stakeholder gets a personalized dashboard with features relevant to their role.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "College Administrators",
                icon: GraduationCap,
                features: [
                  "Department & faculty management",
                  "Fee collection tracking",
                  "Admission workflows",
                  "Institution-wide reports"
                ],
                gradient: "from-blue-500 to-blue-600"
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
                gradient: "from-purple-500 to-purple-600"
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
                gradient: "from-emerald-500 to-emerald-600"
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
                gradient: "from-orange-500 to-orange-600"
              }
            ].map((roleData, index) => (
              <motion.div
                key={roleData.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${roleData.gradient} backdrop-blur-sm rounded-2xl p-6 hover:shadow-2xl transition-all duration-300`}
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <roleData.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-white">{roleData.role}</h3>
                <ul className="space-y-2.5">
                  {roleData.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/90">
                      <CheckCircle className="w-4 h-4 text-white/90 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Normal BG */}
      <section
        id="how-it-works"
        className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Quick Setup
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Get Started in{" "}
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                3 Easy Steps
              </span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              From signup to going live in under 10 minutes. No credit card required.
            </p>
          </motion.div>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-primary to-accent opacity-20 hidden md:block" />

            <div className="space-y-4 md:space-y-8">
              {[
                {
                  step: "1",
                  title: "Sign Up & Verify",
                  description: "Create your account in 30 seconds. Verify your institution instantly through automated authentication.",
                  icon: Shield,
                  gradient: "from-rose-500 to-rose-600",
                  highlights: ["Instant verification", "No paperwork", "Enterprise SSO"]
                },
                {
                  step: "2",
                  title: "Configure Your System",
                  description: "Import student data, set up departments, and configure user roles with our intelligent setup wizard.",
                  icon: Target,
                  gradient: "from-amber-500 to-amber-600",
                  highlights: ["Smart data import", "Custom workflows", "Role templates"]
                },
                {
                  step: "3",
                  title: "Launch & Scale",
                  description: "Invite your team, activate modules, and start managing operations. Support available 24/7.",
                  icon: Zap,
                  gradient: "from-cyan-500 to-cyan-600",
                  highlights: ["One-click launch", "Live training", "Dedicated support"]
                }
              ].map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative flex gap-3 md:gap-8 group"
                >
                  {/* Step Number Circle */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg relative z-10`}
                    >
                      <span className="text-xl md:text-2xl font-bold text-white">{step.step}</span>
                    </motion.div>
                    {i < 2 && (
                      <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 w-0.5 h-4 md:h-8 bg-gradient-to-b from-accent/50 to-transparent md:block" />
                    )}
                  </div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex-1 bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-8 hover:border-accent/40 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-3 md:mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-foreground">{step.title}</h3>
                        <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                      {step.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/onboarding" className="flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day trial • Setup in minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integrations" className="py-32 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm mb-4">
              <Code2 className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-600">Integrations</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              Connect With <span className="text-gradient">Your Tools</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Seamlessly integrate with your existing systems and third-party services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Google Workspace",
                description: "Sync contacts, calendars, and documents automatically",
                logo: "https://www.google.com/favicon.ico",
              },
              {
                title: "Microsoft 365",
                description: "Native integration with Teams and OneDrive",
                logo: "https://www.microsoft.com/favicon.ico",
              },
              {
                icon: Cpu,
                title: "REST API",
                description: "Full-featured API for custom integrations",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card/50 border border-border rounded-2xl p-8 hover:border-accent/40 transition-all duration-300 group cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-all"
                >
                  {item.logo ? (
                    <img 
                      src={item.logo} 
                      alt={item.title}
                      className="w-6 h-6"
                    />
                  ) : (
                    <item.icon className="w-6 h-6 text-accent" />
                  )}
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg border-accent/30 hover:border-accent/60 hover:bg-accent/5"
              asChild
            >
              <a href="#">
                <Code2 className="w-4 h-4 mr-2" />
                View Full API Documentation
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      {/* Testimonials - Normal BG */}
      <section id="testimonials" className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
             Real Results, <span className="text-accent">Real Time Saved</span>
          </h2>
          <p className="text-lg text-foreground/80">
            See how institutions cut admin work by 80% in the first 3 months.
          </p>
        </div>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </section>

      {/* Pricing Section */}
      {/* Pricing - Light Accent BG */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-accent/5 dark:bg-accent/10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-primary/5 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Transparent Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              Plans for Every Institution
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Mobile & Tablet Table View */}
          <div className="xl:hidden max-w-7xl mx-auto mb-8">
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-4 px-2 text-sm font-semibold text-foreground sticky left-0 bg-background z-10">Feature</th>
                    <th className="py-4 px-2 text-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-xl">
                      <div className="text-white">
                        <div className="text-base font-bold mb-1">Starter</div>
                        <div className="text-2xl font-bold">Free</div>
                        <div className="text-xs opacity-80">Forever</div>
                      </div>
                    </th>
                    <th className="py-4 px-2 text-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-t-xl">
                      <div className="text-white">
                        <div className="text-base font-bold mb-1">Professional</div>
                        <div className="text-2xl font-bold">₹1,300</div>
                        <div className="text-xs opacity-80">/month</div>
                      </div>
                    </th>
                    <th className="py-4 px-2 text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-t-xl">
                      <div className="text-white">
                        <div className="text-base font-bold mb-1">Enterprise</div>
                        <div className="text-2xl font-bold">Custom</div>
                        <div className="text-xs opacity-80">Contact sales</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Students", starter: "500", pro: "10,000", enterprise: "Unlimited" },
                    { name: "Storage", starter: "5 GB", pro: "500 GB", enterprise: "Unlimited" },
                    { name: "Admin accounts", starter: "2", pro: "10", enterprise: "Unlimited" },
                    { name: "Student information", starter: true, pro: true, enterprise: true },
                    { name: "Attendance tracking", starter: true, pro: true, enterprise: true },
                    { name: "Grade management", starter: true, pro: true, enterprise: true },
                    { name: "Placement portal", starter: false, pro: true, enterprise: true },
                    { name: "Resume builder", starter: false, pro: true, enterprise: true },
                    { name: "Finance management", starter: false, pro: true, enterprise: true },
                    { name: "Email support", starter: true, pro: true, enterprise: true },
                    { name: "Priority support", starter: false, pro: true, enterprise: true },
                    { name: "Dedicated account manager", starter: false, pro: false, enterprise: true },
                    { name: "Custom integrations", starter: false, pro: true, enterprise: true },
                    { name: "SLA guarantee (99.9%)", starter: false, pro: false, enterprise: true },
                    { name: "On-premise deployment", starter: false, pro: false, enterprise: true },
                    { name: "Advanced analytics", starter: false, pro: false, enterprise: true },
                  ].map((feature, idx) => (
                    <tr key={feature.name} className={idx % 2 === 0 ? "bg-secondary/30" : ""}>
                      <td className="py-3 px-3 text-xs text-foreground sticky left-0 bg-background z-10">{feature.name}</td>
                      <td className="py-3 px-3 text-center">
                        {typeof feature.starter === 'string' ? (
                          <span className="text-xs font-semibold text-foreground">{feature.starter}</span>
                        ) : feature.starter ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {typeof feature.pro === 'string' ? (
                          <span className="text-xs font-semibold text-foreground">{feature.pro}</span>
                        ) : feature.pro ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {typeof feature.enterprise === 'string' ? (
                          <span className="text-xs font-semibold text-foreground">{feature.enterprise}</span>
                        ) : feature.enterprise ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-4 px-3 sticky left-0 bg-background z-10"></td>
                    <td className="py-4 px-3">
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold text-xs"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-1">
                          Get Started
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </td>
                    <td className="py-4 px-3">
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold text-xs"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-1">
                          Get Started
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </td>
                    <td className="py-4 px-3">
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold text-xs"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-1">
                          Get Started
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop Card View */}
          <div className="hidden xl:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                
                period: "Forever",
                description: "Perfect for small institutions testing the platform",
                features: [
                  "Up to 500 students",
                  "Basic student information",
                  "Attendance tracking",
                  "Grade management",
                  "5 GB storage",
                  "Email support",
                ],
                highlighted: false,
              },
              {
                name: "Professional",
                price: "₹1,300",
                period: "/month",
                badge: "Most Popular",
                description: "Best for growing institutions",
                features: [
                  "Up to 10,000 students",
                  "All Starter features",
                  "Placement portal",
                  "Resume builder",
                  "Finance management",
                  "500 GB storage",
                  "Priority support",
                  "Custom integrations",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact sales",
                description: "For large universities & institutions",
                features: [
                  "Unlimited students",
                  "All features",
                  "Dedicated account manager",
                  "Custom integrations",
                  "Unlimited storage",
                  "SLA guarantee (99.9%)",
                  "On-premise deployment",
                  "Advanced analytics",
                ],
                highlighted: false,
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative rounded-3xl transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-secondary/50 border-2 border-primary shadow-2xl"
                    : "bg-card/50 border border-border hover:border-primary/40"
                }`}
              >
                {plan.badge && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full"
                  >
                    {plan.badge}
                  </motion.div>
                )}

                <div className="p-8 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {plan.period}
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className={`w-full mb-8 rounded-lg font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-lg"
                        : "bg-gray-900/10 dark:bg-white/10 hover:bg-gray-900/20 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-900/30 dark:border-white/30"
                    }`}
                    asChild
                  >
                    <Link to="/onboarding">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Annual Discount Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                ✓ Save 20% with annual billing
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ - Light Accent BG */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5 dark:bg-accent/10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-foreground/80">
              Everything you need to know about getting started with OmniFlow
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "How long does implementation typically take?",
                a: "Most institutions go live in 2-4 weeks. We provide white-glove onboarding support to ensure a smooth transition.",
              },
              {
                q: "Can you import our existing data?",
                a: "Yes! We support data import from Excel, CSV, and other ERP systems. Our team handles the migration at no extra cost.",
              },
              {
                q: "What systems can OmniFlow integrate with?",
                a: "We support Google Workspace, Microsoft 365, Canvas LMS, and any system with REST API. Custom integrations available.",
              },
              {
                q: "Is there an API we can use?",
                a: "Yes, OmniFlow has a comprehensive REST API with full documentation. Perfect for custom development.",
              },
              {
                q: "Is OmniFlow GDPR compliant?",
                a: "Yes, OmniFlow is fully GDPR and FERPA compliant. All data is encrypted at rest and in transit. We're SOC 2 Type II certified.",
              },
              {
                q: "What about data backup and recovery?",
                a: "We perform hourly backups with 30-day retention. Recovery time objective (RTO) is less than 1 hour.",
              },
            ].map((item, idx) => (
              <FAQItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Normal BG */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent -z-10" />
        <FloatingParticles />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Stop managing education{" "}
              <span className="text-gradient" style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                on spreadsheets
              </span>
            </h2>
            <p className="text-lg text-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join 500+ institutions saving 2000+ hours annually on admin work. No credit card needed. Free 14-day trial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                aria-label="Start your free 14-day trial"
              >
                <Link to="/onboarding" className="flex items-center gap-2">
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border border-muted-foreground/30 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all duration-300 px-10 py-6 text-base font-semibold rounded-lg"
                aria-label="Schedule a demo with our sales team"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-xs text-foreground/70 mt-6">
              14-day free trial. All features included. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-foreground text-background py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/">
                <div className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-background">
                    OmniFlow
                  </span>
                </div>
              </Link>
              <p className="text-sm text-background/80 leading-relaxed max-w-xs">
                The complete ERP solution for modern educational institutions. Empowering education worldwide.
              </p>
            </motion.div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features", aria: "View all features" },
                  { label: "Pricing", href: "#pricing", aria: "View pricing plans" },
                  { label: "Dashboard", href: "/dashboard", aria: "Access dashboard" },
                  { label: "Integrations", href: "#integrations", aria: "View integrations" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "Blog", href: "/blog", aria: "Read our blog" },
                  { label: "Careers", href: "/careers", aria: "View career opportunities" },
                  { label: "Contact", href: "/contact", aria: "Contact us" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy", href: "/privacy", aria: "Privacy policy" },
                  { label: "Terms", href: "/terms", aria: "Terms of service" },
                  { label: "GDPR", href: "/gdpr", aria: "GDPR compliance" },
                  { label: "Cookies", href: "/cookies", aria: "Cookie policy" },
                ],
              },
            ].map((col) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="font-semibold text-background mb-6 text-base">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <motion.a
                        href={link.href}
                        aria-label={link.aria}
                        className="text-sm text-background/70 hover:text-background transition-all duration-300 inline-block"
                        whileHover={{ x: 4 }}
                      >
                        {link.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Footer Bottom - Social Links & Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-background/20 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <p className="text-sm text-background/70">
              © 2025 OmniFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {[
                { icon: Twitter, name: "Twitter", url: "#", ariaLabel: "Follow us on Twitter" },
                { icon: Linkedin, name: "LinkedIn", url: "#", ariaLabel: "Follow us on LinkedIn" },
                { icon: Facebook, name: "Facebook", url: "#", ariaLabel: "Follow us on Facebook" },
                { icon: Instagram, name: "Instagram", url: "#", ariaLabel: "Follow us on Instagram" },
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  aria-label={social.ariaLabel}
                  className="text-background/60 hover:text-background transition-all duration-300"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Gradual Blur Effect at Bottom - Outside Footer */}
      <GradualBlur
        target="page"
        position="bottom"
        height="4rem"
        strength={1.5}
        divCount={4}
        curve="bezier"
        exponential={false}
        opacity={0.8}
      />
    </div>
  );
}

export default LandingPage;

