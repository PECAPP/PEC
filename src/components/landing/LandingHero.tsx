'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

export function LandingHero() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // GSAP Scroll Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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
    <>
      {/* Navigation - Glassmorphic */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
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
                <Link href="/auth">Get Started</Link>
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

          <motion.p
            variants={item}
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-12"
          >
            Manage everything from one intuitive interface. Built for modern educational institutions.
          </motion.p>

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
              <Link href="/auth" className="flex items-center gap-3">
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
              <Link href="/apply-institution" className="flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                Apply as Institution
              </Link>
            </Button>
          </motion.div>
        </motion.div>


        {/* Social Proof */}
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
                 <div className="marquee-content flex gap-8 md:gap-12 animate-[marquee_20s_linear_infinite] md:animate-[marquee_40s_linear_infinite] w-max">
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
                       key={`logo-${idx}`}
                       className="flex-shrink-0 w-32 md:w-40 h-24 md:h-32 rounded-none bg-white border border-white/20 flex items-center justify-center p-4 md:p-6 neo-brutal-shadow transition-all duration-300 group hover:scale-105"
                     >
                       <div className="text-center w-full h-full flex flex-col items-center justify-center gap-2 md:gap-3">
                         <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center px-2">
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
                       key={`logo-dup-${idx}`}
                       className="flex-shrink-0 w-32 md:w-40 h-24 md:h-32 rounded-none bg-white border border-white/20 flex items-center justify-center p-4 md:p-6 neo-brutal-shadow transition-all duration-300 group hover:scale-105"
                     >
                       <div className="text-center w-full h-full flex flex-col items-center justify-center gap-2 md:gap-3">
                         <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center px-2">
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
    </>
  );
}
