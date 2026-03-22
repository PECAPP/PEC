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
import React, { useRef, useEffect, useState } from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import GradualBlur from "@/components/ui/GradualBlur";
import { NeoBrutalGraphics } from "@/components/NeoBrutalGraphics";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      className="bg-card/50 border-2 border-border border-l-4 rounded-none overflow-hidden hover:border-foreground transition-all duration-300 neo-brutal-shadow"
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
        className="overflow-hidden border-t-2 border-border"
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
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);
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
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-scroll relative strict-sharp-corners snap-y snap-mandatory">
      <NeoBrutalGraphics />
      {/* Flat Grid Background - Neo-Brutalist */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black_90%,transparent_100%)]" />
      </div>

      {/* Navigation - Glassmorphic */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img src="/logo.png" alt="PEC" className="h-12 w-auto" />
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {["Features", "How it Works", "Testimonials"].map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  whileHover={{ y: -2 }}
                  className="text-sm font-semibold text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  {link}
                </motion.a>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="sm"
                asChild
                className="rounded-lg bg-white/20 text-white hover:bg-white/30 font-semibold px-6 backdrop-blur-sm border border-white/30 transition-all duration-200"
                aria-label="Get started with test credentials"
              >
                <Link to="/auth">Get Started</Link>
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
        {/* Hero Background Image */}
        <div className="absolute inset-0 -z-0">
          <img 
            src="/image.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        {/* Y2K Hero Decor */}
         <div className="absolute top-1/4 left-10 hidden lg:block pointer-events-none opacity-40">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.5">
               <circle cx="50" cy="50" r="40"/>
               <circle cx="50" cy="50" r="30"/>
               <circle cx="50" cy="50" r="20"/>
               <line x1="0" y1="50" x2="100" y2="50"/>
               <line x1="50" y1="0" x2="50" y2="100"/>
            </svg>
         </div>
         <div className="absolute bottom-1/3 right-20 hidden lg:block pointer-events-none opacity-40">
             <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-12 bg-white/50"/>)}
             </div>
         </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto text-center relative z-10 w-full mb-20"
        >
          {/* Main Heading */}
          <motion.h1
            variants={item}
            initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mt-16 max-w-4xl mx-auto mb-8"
            style={{ fontFamily: "'Monument Extended', serif", fontWeight: 900 }}
          >
            <span className="bg-gradient-to-r from-orange-900 to-orange-800 bg-clip-text text-transparent drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
              Powerful Dashboard, Beautifully Designed
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-12"
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
              className="neo-brutal-btn group bg-white text-black px-8 py-6 text-base border-2 border-black"
              aria-label="View test credentials and start trial"
            >
              <Link to="/auth" className="flex items-center gap-3">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="neo-brutal-btn group bg-transparent border-2 border-white hover:bg-white/10 px-8 py-6 text-base font-bold text-white hover:text-white"
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
          initial={{ opacity: 0, y: 40, filter: "blur(20px)", scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-40 w-full overflow-x-auto"
        >
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-none border-4 border-black bg-black p-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-none bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
                <div className="w-4 h-4 rounded-none bg-black" />
                <div className="w-4 h-4 rounded-none bg-yellow-400 border-2 border-black" />
                <div className="w-4 h-4 rounded-none bg-green-400 border-2 border-black" />
              </div>
              <style>{`
                iframe {
                  scrollbar-width: none;
                }
                iframe::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <iframe
                src="/demo-dashboard"
                className="rounded-none w-full h-[700px] border-4 border-black bg-neutral-900"
                title="PEC Dashboard Demo"
                scrolling="no"
              />

              <div className="absolute inset-0 rounded-none bg-transparent pointer-events-none" />
              {/* Gradient Overlay - Fades to Dark to match dashboard bg */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent z-20 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Social Proof - Merged into Hero - Transparent Parent with White Cards */}
        <div className="mt-20 max-w-7xl mx-auto relative z-10 w-full">
           
           <div className="text-center mb-16">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-wider font-monument">
                 Trusted by 500+ Institutions
               </h2>
             </motion.div>
           </div>
   
             {/* Infinite Scrolling Marquee */}
             <div className="relative overflow-hidden w-full">
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
                 {/* Mobile: 15s (Faster), Desktop: 40s (Slower) */}
                 <div className="marquee-content flex gap-8 md:gap-12 animate-[marquee_20s_linear_infinite] md:animate-[marquee_40s_linear_infinite] w-max">
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
                       className="flex-shrink-0 w-32 md:w-40 h-24 md:h-32 rounded-none bg-white border border-white/20 flex items-center justify-center p-4 md:p-6 neo-brutal-shadow transition-all duration-300 group hover:scale-105"
                     >
                       <div className="text-center w-full h-full flex flex-col items-center justify-center gap-2 md:gap-3">
                         <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center px-2">
                           {/* ORIGINAL LOGO COLORS */}
                           <img 
                             src={client.logo} 
                             alt={`${client.name} logo`}
                             className="max-w-full max-h-full object-contain"
                           />
                         </div>
                         <p className="text-[10px] md:text-xs font-medium text-black group-hover:text-black/70 transition-colors">
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
                       className="flex-shrink-0 w-32 md:w-40 h-24 md:h-32 rounded-none bg-white border border-white/20 flex items-center justify-center p-4 md:p-6 neo-brutal-shadow transition-all duration-300 group hover:scale-105"
                     >
                       <div className="text-center w-full h-full flex flex-col items-center justify-center gap-2 md:gap-3">
                         <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center px-2">
                            {/* ORIGINAL LOGO COLORS */}
                           <img 
                             src={client.logo} 
                             alt={`${client.name} logo`}
                             className="max-w-full max-h-full object-contain"
                           />
                         </div>
                         <p className="text-[10px] md:text-xs font-medium text-black group-hover:text-black/70 transition-colors">
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

      {/* Logo Scroll - Dark BG with Image */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[50vh] flex items-center snap-start">
        <div className="absolute inset-0 z-0 bg-orange-600">
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Why{" "}
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">PEC</span>
            </h2>
            <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
              The all-in-one platform trusted by leading institutions
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 relative">

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
                className="group p-8 rounded-none border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
              >
                {/* Corner Accents */}
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/30" />
                
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-none border border-white/20 bg-black/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid - Dark BG with Image */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
        {/* Background Image - Layer 0 */}
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-5.png')` }}
          />
          {/* Blue Tint */}
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        {/* Content - Layer 10 */}
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Everything You Need to Manage Education</span>
            </h2>
            <p className="text-lg text-white/90 font-medium max-w-2xl mx-auto">
              From admissions to placements, our platform covers every aspect of
              institutional management with cutting-edge technology.
            </p>
          </motion.div>

          <div className="relative max-w-7xl mx-auto w-full">
            {/* Responsive Bento Grid - Uniform on mobile, 2 cols on tablet, full grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(140px,auto)]">
              
              {/* Student Information System - Large horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                onClick={() => navigate('/profile')}
                className="col-span-1 sm:col-span-2 md:col-span-2 row-span-1 md:row-span-2 bg-sky-900 border-2 border-sky-500 hover:bg-sky-800 rounded-none p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-8 right-8 w-32 h-32 bg-white/5 rounded-none transform rotate-45" />
                
                {/* Y2K Tech Decoration */}
                <div className="absolute bottom-4 right-4 flex gap-1 items-end opacity-50">
                   <div className="w-1 h-3 bg-white"></div>
                   <div className="w-1 h-5 bg-white"></div>
                   <div className="w-1 h-2 bg-white"></div>
                   <div className="w-1 h-6 bg-white"></div>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-black/50 border border-white/20 p-3 mb-6">
                     <Users className="w-full h-full text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Student Information System
                  </h2>
                  <p className="text-sm text-white/80 font-medium">
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
                className="col-span-1 sm:col-span-2 md:col-span-2 row-span-1 bg-indigo-900 border-2 border-indigo-600 rounded-none p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-black border-2 border-indigo-600 p-3 neo-brutal-shadow">
                  <BookOpen className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif", fontStyle: "italic" }}>
                    Academic Management
                  </h3>
                  <p className="text-sm text-white/90 font-medium">
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
                className="col-span-1 row-span-1 md:row-span-2 bg-blue-900 border-2 border-blue-600 rounded-none p-6 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-black border-2 border-blue-600 p-2.5 neo-brutal-shadow">
                   <ClipboardCheck className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Attendance Tracking
                  </h3>
                  <p className="text-sm text-white/90 font-medium">
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
                className="col-span-1 row-span-1 bg-cyan-900 border-2 border-cyan-600 rounded-none p-6 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-black border-2 border-cyan-600 p-2.5 neo-brutal-shadow">
                  <Briefcase className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Placements
                  </h3>
                  <p className="text-xs text-white/90 font-bold">AI Resume Analyzer</p>
                </div>
              </motion.div>

              {/* Examinations & Grades - Wide horizontal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate('/examinations')}
                className="col-span-1 row-span-1 md:row-span-2 bg-violet-900 border-2 border-violet-600 rounded-none p-6 sm:p-8 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-black border-2 border-violet-600 p-3 neo-brutal-shadow">
                  <BarChart3 className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif", fontStyle: "italic" }}>
                    Examinations & Grades
                  </h3>
                  <p className="text-sm text-white/90 font-medium">
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
                className="col-span-1 row-span-1 md:row-span-2 bg-sky-900 border-2 border-sky-600 rounded-none p-6 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-black border-2 border-sky-600 p-2.5 neo-brutal-shadow">
                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Finance
                  </h3>
                  <p className="text-xs text-white/90 font-bold">
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
                className="col-span-1 row-span-1 md:row-span-2 bg-cyan-900 border-2 border-cyan-600 rounded-none p-6 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-black border-2 border-cyan-600 p-2.5 neo-brutal-shadow">
                  <FileText className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif", fontStyle: "italic" }}>
                    Resume Builder
                  </h3>
                  <p className="text-xs text-white/90 font-bold">
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
                className="col-span-1 md:col-span-1 row-span-1 bg-indigo-900 border-2 border-indigo-600 rounded-none p-6 flex flex-col justify-between group hover:shadow-none neo-brutal-shadow transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-black border-2 border-indigo-600 p-2.5 neo-brutal-shadow">
                  <TrendingUp className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Monument Extended', serif" }}>
                    Dashboard
                  </h3>
                  <p className="text-xs text-white/90 font-bold">Real-time insights</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access - Dark BG with Image */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
         {/* Background Image - Layer 0 */}
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-15.png')` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-emerald-600 mb-6 neo-brutal-shadow">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Role-Based Access</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Tailored for Every User</span>
            </h2>
            <p className="text-lg text-white/90 font-medium max-w-2xl mx-auto">
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
            ].map((roleData, index) => (
              <motion.div
                key={roleData.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`${roleData.bgColor} border-2 ${roleData.borderColor} rounded-none p-6 transition-all duration-300 hover:shadow-none neo-brutal-shadow group cursor-pointer`}
              >
                <div className={`w-14 h-14 bg-black border-2 ${roleData.borderColor} rounded-none flex items-center justify-center mb-4 neo-brutal-shadow`}>
                  <roleData.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-white">{roleData.role}</h3>
                <ul className="space-y-2.5">
                  {roleData.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Dark BG with Image */}
      <section
        id="how-it-works"
        className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start"
      >
         {/* Background Image - Layer 0 */}
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-10.png')` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-orange-600 mb-6 neo-brutal-shadow">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">
                Quick Setup
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">Get Started in 3 Easy Steps</span>
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
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
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-none bg-white border-2 border-foreground flex items-center justify-center neo-brutal-shadow relative z-10 text-foreground`}
                    >
                      <span className="text-xl md:text-2xl font-bold text-foreground">{step.step}</span>
                    </motion.div>
                    {i < 2 && (
                      <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 w-0.5 h-4 md:h-8 bg-gradient-to-b from-accent/50 to-transparent md:block" />
                    )}
                  </div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className={`flex-1 ${step.bgColor} border-2 ${step.borderColor} rounded-none p-4 md:p-8 hover:shadow-none neo-brutal-shadow transition-all duration-300`}
                  >
                    <div className="flex items-start gap-4 mb-3 md:mb-4">
                     <div className={`p-3 bg-black border-2 ${step.borderColor} neo-brutal-shadow`}>
                        <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white">{step.title}</h3>
                        <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium">
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

      {/* Integration Section - Dark BG with Image */}
      <section id="integrations" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
         {/* Background - Blue Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-sky-950 via-blue-950 to-slate-950" />
        {/* Y2K Circuit Decor */}
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none text-white z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor">
           <path d="M100 0 L80 0 L80 20 L50 20 L50 50" strokeWidth="0.5"/>
           <circle cx="50" cy="50" r="2" fill="currentColor"/>
           <circle cx="80" cy="20" r="2" fill="currentColor"/>
        </svg>
        <div className="absolute top-10 left-10 opacity-20 z-0">
           <div className="flex gap-2">
              <div className="w-2 h-2 bg-white rounded-none"/>
              <div className="w-2 h-2 bg-white rounded-none"/>
              <div className="w-2 h-2 bg-transparent border border-white rounded-none"/>
           </div>
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-sky-600 mb-4 neo-brutal-shadow">
              <Code2 className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-sky-400">Integrations</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Connect With Your Tools</span>
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Seamlessly integrate with your existing systems and third-party services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Cloud,
                title: "Google Workspace",
                description: "Sync contacts, calendars, and documents automatically",
              },
              {
                icon: Server,
                title: "Microsoft 365",
                description: "Native integration with Teams and OneDrive",
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
                className={`${
                  idx === 0 ? 'bg-blue-900/90 border-blue-400' :
                  idx === 1 ? 'bg-sky-800/90 border-sky-400' :
                  'bg-cyan-900/90 border-cyan-400'
                } border-2 rounded-none p-8 hover:shadow-none neo-brutal-shadow transition-all duration-300 group cursor-default`}
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`w-12 h-12 rounded-none ${
                    idx === 0 ? 'bg-blue-950 border-blue-400' :
                    idx === 1 ? 'bg-sky-950 border-sky-400' :
                    'bg-cyan-950 border-cyan-400'
                  } border-2 flex items-center justify-center mb-4 neo-brutal-shadow`}
                >
                  {item.icon && <item.icon className={`w-6 h-6 ${
                    idx === 0 ? 'text-blue-300' :
                    idx === 1 ? 'text-sky-300' :
                    'text-cyan-300'
                  }`} />}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sky-100 text-sm font-medium">
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

      {/* Testimonials - Neo-Brutalist */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black snap-start">
        {/* Neo-Brutal Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 2px, transparent 2px, transparent 40px),
                             repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 40px)`
          }} />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-6 uppercase" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Real Results</span>
            </h2>
            <p className="text-2xl text-white font-bold max-w-3xl mx-auto uppercase tracking-wide">
              80% Less Admin Work in 3 Months
            </p>
          </motion.div>
          
          {/* Testimonial Cards Loop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {testimonials.slice(0, 4).map((testimonial, idx) => {
              const colors = [
                { bg: 'bg-yellow-400', border: 'border-yellow-400', shadow: 'shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]', text: 'text-black' },
                { bg: 'bg-green-400', border: 'border-green-400', shadow: 'shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]', text: 'text-black' },
                { bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]', text: 'text-white' },
                { bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]', text: 'text-white' }
              ];
              const color = colors[idx];
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`${color.bg} border-4 border-black rounded-none p-6 ${color.shadow} transition-all duration-200 cursor-pointer`}
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-black" fill="black" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className={`${color.text} font-bold text-sm mb-6 leading-relaxed`}>
                    "{testimonial.quote.slice(0, 150)}..."
                  </p>
                  
                  {/* Saved Hours Badge */}
                  <div className="inline-block px-3 py-2 bg-black border-2 border-black rounded-none mb-4">
                    <span className="text-white font-black text-xs uppercase">{testimonial.savedHours}</span>
                  </div>
                  
                  {/* Author */}
                  <div className={`${color.text} border-t-4 border-black pt-4`}>
                    <h4 className="font-black text-base mb-1">{testimonial.name}</h4>
                    <p className="font-bold text-xs opacity-80">{testimonial.designation}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* Pricing - Dark Black BG */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative border-t border-neutral-800 overflow-hidden min-h-screen flex items-center snap-start">
        {/* Y2K Coin/Chip Decor */}
        <div className="absolute top-10 right-10 opacity-10 animate-spin-slow z-0">
           <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="white" strokeWidth="1">
              <circle cx="60" cy="60" r="50" strokeDasharray="10 10"/>
              <circle cx="60" cy="60" r="30"/>
              <path d="M60 10 L60 110 M10 60 L110 60" opacity="0.5"/>
           </svg>
        </div>

        {/* Flowing Gradient Background - SVG */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950">
          {/* SVG Gradient Blobs */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#047857" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#134e4a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#042f2e" stopOpacity="0.6" />
              </linearGradient>
              <radialGradient id="gradient3">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Flowing blob shapes */}
            <path d="M0 200 Q 300 100, 600 200 T 1200 200 L 1200 0 L 0 0 Z" fill="url(#gradient1)" />
            <path d="M0 400 Q 400 300, 800 400 T 1600 400 L 1600 0 L 0 0 Z" fill="url(#gradient2)" opacity="0.8" />
            <ellipse cx="30%" cy="40%" rx="500" ry="600" fill="url(#gradient3)" />
            <ellipse cx="80%" cy="60%" rx="600" ry="500" fill="url(#gradient3)" />
            <ellipse cx="50%" cy="80%" rx="700" ry="400" fill="url(#gradient3)" opacity="0.6" />
            <path d="M1920 600 Q 1600 700, 1200 600 T 0 600 L 0 1080 L 1920 1080 Z" fill="url(#gradient1)" opacity="0.6" />
          </svg>
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-zinc-600 mb-4 neo-brutal-shadow">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Transparent Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">Plans for Every Institution</span>
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Mobile Card View - Vertical Stack */}
          <div className="lg:hidden max-w-2xl mx-auto mb-8 space-y-6 px-4">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                gradient: "from-lime-700 to-emerald-700",
                features: [
                  { name: "Students", value: "500" },
                  { name: "Storage", value: "5 GB" },
                  { name: "Admin accounts", value: "2" },
                  { name: "Student information", included: true },
                  { name: "Attendance tracking", included: true },
                  { name: "Grade management", included: true },
                  { name: "Email support", included: true },
                ]
              },
              {
                name: "Professional",
                price: "₹1,300",
                period: "/month",
                badge: "POPULAR",
                gradient: "from-teal-600 to-cyan-600",
                features: [
                  { name: "Students", value: "10,000" },
                  { name: "Storage", value: "500 GB" },
                  { name: "Admin accounts", value: "10" },
                  { name: "All Starter features", included: true },
                  { name: "Placement portal", included: true },
                  { name: "Resume builder", included: true },
                  { name: "Finance management", included: true },
                  { name: "Priority support", included: true },
                  { name: "Custom integrations", included: true },
                ]
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact sales",
                gradient: "from-emerald-700 to-green-700",
                features: [
                  { name: "Students", value: "Unlimited" },
                  { name: "Storage", value: "Unlimited" },
                  { name: "Admin accounts", value: "Unlimited" },
                  { name: "All features", included: true },
                  { name: "Dedicated account manager", included: true },
                  { name: "SLA guarantee (99.9%)", included: true },
                  { name: "On-premise deployment", included: true },
                  { name: "Advanced analytics", included: true },
                ]
              },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-black text-xs font-black rounded-full z-10">
                    {plan.badge}
                  </div>
                )}
                <div className={`bg-gradient-to-br ${plan.gradient} rounded-2xl p-6 shadow-2xl`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-black text-white mb-1">{plan.price}</div>
                    <div className="text-sm text-white/90 font-medium">{plan.period}</div>
                  </div>
                  
                  <Button
                    asChild
                    size="lg"
                    className="w-full mb-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold border-2 border-white/40 rounded-xl py-6"
                  >
                    <Link to="/onboarding" className="flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                        <span className="text-sm font-semibold text-white">{feature.name}</span>
                        {feature.value ? (
                          <span className="text-sm font-black text-white">{feature.value}</span>
                        ) : feature.included ? (
                          <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-white/40 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block max-w-7xl mx-auto mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-lg rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b-2 border-emerald-900/50">
                    <th className="text-left py-5 px-4 text-sm font-bold text-white bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950 border-r border-emerald-800/30">Feature</th>
                    <th className="py-5 px-4 text-center bg-gradient-to-br from-lime-700 to-emerald-700 rounded-t-xl min-w-[140px]">
                      <div className="text-white">
                        <div className="text-sm font-bold mb-1">Starter</div>
                        <div className="text-3xl font-black">Free</div>
                        <div className="text-xs opacity-90 font-medium">Forever</div>
                      </div>
                    </th>
                    <th className="py-5 px-4 text-center bg-gradient-to-br from-teal-600 to-cyan-600 rounded-t-xl min-w-[140px] relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-full whitespace-nowrap">
                        POPULAR
                      </div>
                      <div className="text-white">
                        <div className="text-sm font-bold mb-1">Professional</div>
                        <div className="text-3xl font-black">₹1,300</div>
                        <div className="text-xs opacity-90 font-medium">/month</div>
                      </div>
                    </th>
                    <th className="py-5 px-4 text-center bg-gradient-to-br from-emerald-700 to-green-700 rounded-t-xl min-w-[140px]">
                      <div className="text-white">
                        <div className="text-sm font-bold mb-1">Enterprise</div>
                        <div className="text-3xl font-black">Custom</div>
                        <div className="text-xs opacity-90 font-medium">Contact sales</div>
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
                    <tr key={feature.name} className={idx % 2 === 0 ? "bg-emerald-900/20" : "bg-emerald-950/40"}>
                      <td className="py-4 px-4 text-sm font-semibold text-white border-r border-emerald-800/30">{feature.name}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.starter === 'string' ? (
                          <span className="text-sm font-bold text-white">{feature.starter}</span>
                        ) : feature.starter ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.pro === 'string' ? (
                          <span className="text-sm font-bold text-white">{feature.pro}</span>
                        ) : feature.pro ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.enterprise === 'string' ? (
                          <span className="text-sm font-bold text-white">{feature.enterprise}</span>
                        ) : feature.enterprise ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-950/60">
                    <td className="py-5 px-4 bg-emerald-950/60 border-r border-emerald-800/30"></td>
                    <td className="py-5 px-4">
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-6 rounded-lg"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-2">
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                    <td className="py-5 px-4">
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-sm py-6 rounded-lg shadow-xl"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-2">
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                    <td className="py-5 px-4">
                      <Button
                        asChild
                        size="lg"
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm py-6 rounded-lg"
                      >
                        <Link to="/onboarding" className="flex items-center justify-center gap-2">
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

      {/* FAQ - Dark Blue BG */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative border-t-2 border-slate-700 overflow-hidden min-h-screen flex items-center snap-start">
        {/* Y2K Question Mark Decor */}
        <div className="absolute -left-10 bottom-0 opacity-5 pointer-events-none transform rotate-12 z-0">
           <span className="text-[300px] font-bold font-mono text-white">?</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 z-0" />
        
         {/* Background Image - Layer 0 */}
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-13.png')` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content - Layer 10 */}
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Frequently Asked Questions</span>
            </h2>
            <p className="text-lg text-white/80">
              Everything you need to know about getting started with PEC
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
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`border-2 rounded-none overflow-hidden transition-all duration-300 neo-brutal-shadow ${
                  activeFAQIndex === idx 
                    ? "bg-slate-800 border-cyan-500" 
                    : "bg-slate-900 border-cyan-900 hover:border-cyan-700 hover:bg-slate-800"
                }`}
              >
                <button
                  onClick={() => setActiveFAQIndex(activeFAQIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                  aria-expanded={activeFAQIndex === idx}
                >
                  <span className={`font-bold text-lg transition-colors ${
                    activeFAQIndex === idx ? "text-cyan-400" : "text-white group-hover:text-cyan-200"
                  }`}>
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFAQIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-5 h-5 transition-colors ${
                      activeFAQIndex === idx ? "text-cyan-400" : "text-cyan-700 group-hover:text-cyan-400"
                    }`} />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: activeFAQIndex === idx ? "auto" : 0,
                    opacity: activeFAQIndex === idx ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-cyan-900/50">
                    <p className="text-white/80 leading-relaxed font-medium">
                      {item.a}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Black with Animated Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center snap-start">
        {/* Animated Green Grid on Mouse Move */}
        <motion.div 
          className="absolute inset-0 z-0 bg-black"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          onMouseMove={(e) => {
            const { currentTarget, clientX, clientY } = e;
            const rect = currentTarget.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((clientY - rect.top) / rect.height - 0.5) * 20;
            currentTarget.style.transform = `translate(${x}px, ${y}px)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
          }}
        />

        {/* Content - Layer 10 */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Stop managing education{" "}
              </span>
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent" style={{ fontFamily: "'Syne', sans-serif", fontStyle: "italic" }}>
                on spreadsheets
              </span>
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
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
                className="bg-transparent border-2 border-emerald-500 text-white hover:bg-emerald-500/10 px-10 py-6 text-base font-semibold rounded-lg"
                aria-label="Schedule a demo with our sales team"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-xs text-emerald-400/70 mt-6">
              14-day free trial. All features included. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 overflow-hidden snap-start">
        {/* Y2K Footer Grid */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"/>
        
         {/* Background Image - Layer 0 */}
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-20.png')` }}
          />
          <div className="absolute inset-0 bg-black/90" />
        </div>

        <div className="absolute bottom-10 right-10 opacity-30 flex gap-4">
           <div className="w-16 h-1 bg-white"/>
           <div className="w-16 h-1 bg-white/50"/>
           <div className="w-16 h-1 bg-white/20"/>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/">
                <div className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-white">
                    PEC
                  </span>
                </div>
              </Link>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
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
                <h4 className="font-semibold text-white mb-6 text-base">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <motion.a
                        href={link.href}
                        aria-label={link.aria}
                        className="text-sm text-white/60 hover:text-white transition-all duration-300 inline-block"
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
            className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <p className="text-sm text-white/50">
              © 2025 PEC. All rights reserved.
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

