'use client';

import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/1.webp", "/2.webp", "/3.webp"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
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
                <div className="relative h-12 w-32">
                  <Image 
                    src="/logo.png" 
                    alt="PEC Logo" 
                    fill 
                    sizes="128px"
                    className="object-contain" 
                    priority 
                  />
                </div>
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

      {/* Hero Section with Full Height */}
      <section
        ref={heroRef}
        className="h-screen px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center"
      >
        {/* Hero Background Slideshow */}
        <div className="absolute inset-0 -z-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 6, ease: "linear" } // Ken Burns Effect
              }}
              className="absolute inset-0"
            >
              <Image 
                src={images[currentImage]} 
                alt={`Slide ${currentImage + 1}`} 
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
              />
              {/* Golden/Amber Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-black/40 to-amber-900/60 mix-blend-multiply" />
              <div className="absolute inset-0 bg-black/30" />
              
              {/* Noise Texture & Light Leak */}
              <div className="absolute inset-0 bg-noise opacity-[0.03]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,180,0,0.1),transparent_70%)]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Premium Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-[10%] w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/20 -rotate-12 neo-brutal-shadow"
          />
          <motion.div
            animate={{ 
              y: [10, -10, 10],
              rotate: [0, -8, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-[5%] w-48 h-48 bg-yellow-500/5 backdrop-blur-sm border-yellow-500/20 rotate-12 neo-brutal-shadow"
          />
        </div>

        {/* Slide Progress Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {images.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentImage ? "w-8 bg-yellow-500" : "w-4 bg-white/30"
              }`}
              initial={false}
              animate={{
                backgroundColor: idx === currentImage ? "#eab308" : "rgba(255,255,255,0.3)",
                width: idx === currentImage ? 32 : 16
              }}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Scroll</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-yellow-500 to-transparent"
          />
        </motion.div>

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
          className="max-w-6xl mx-auto text-center relative z-10 w-full mb-10"
        >
          {/* Main Heading */}
          <motion.h1
            variants={item}
            initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] max-w-[1100px] mx-auto mb-8 tracking-tight"
            style={{ fontFamily: "'Monument Extended', serif" }}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[5px_5px_0px_rgba(0,0,0,0.3)] inline-block">
              Your Entire Campus,<br className="hidden lg:block" /> All in One Place
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-white/90 font-medium max-w-xl mx-auto mb-10"
          >
            Experience PEC App, the ultimate institutional orchestration platform. Built for efficiency, designed for students.
          </motion.p>

          <motion.div
            variants={item}
            className="hidden sm:flex flex-row items-center justify-center gap-6"
          >
            <Button
              size="lg"
              asChild
              className="neo-brutal-btn group bg-white text-black px-8 py-6 text-base border-2 border-black"
              aria-label="Student login"
            >
              <Link href="/auth" className="flex items-center gap-3">
                Student Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="neo-brutal-btn group bg-transparent border-2 border-white hover:bg-white/10 px-8 py-6 text-base font-bold text-white hover:text-white"
              aria-label="View Features"
            >
              <a href="#features" className="flex items-center gap-3">
                Explore Modules
              </a>
            </Button>
          </motion.div>
        </motion.div>

      </section>
    </>
  );
}
