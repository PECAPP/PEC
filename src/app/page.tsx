'use client';

import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { NeoBrutalGraphics } from "@/components/NeoBrutalGraphics";

// Dynamic imports for sections below the fold
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => mod.HowItWorksSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const IntegrationsSection = dynamic(() => import('@/components/landing/IntegrationsSection').then(mod => mod.IntegrationsSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection').then(mod => mod.TestimonialsSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then(mod => mod.PricingSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => mod.FAQSection), {
  loading: () => <div className="h-[50vh] bg-black animate-pulse" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer), {
  loading: () => <div className="h-64 bg-black animate-pulse" />,
});

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-scroll relative strict-sharp-corners snap-y snap-mandatory">
      <NeoBrutalGraphics />
      
      {/* Flat Grid Background - Neo-Brutalist */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black_90%,transparent_100%)]" />
      </div>

      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
