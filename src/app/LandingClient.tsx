'use client';

import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import { LandingHero } from "@/components/landing/LandingHero";
import { NeoBrutalGraphics } from "@/components/NeoBrutalGraphics";

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



const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => mod.FAQSection), {
  loading: () => <div className="h-[50vh] bg-black animate-pulse" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer), {
  loading: () => <div className="h-64 bg-black animate-pulse" />,
});

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingClient() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative strict-sharp-corners snap-y snap-mandatory">
      <NeoBrutalGraphics />
      
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black_90%,transparent_100%)]" />
      </div>

      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialsSection />

      <FAQSection />
      <Footer />

      {/* GLOBAL MOBILE FIXED BOTTOM BAR - TRANSPARENT FLOATING */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] flex sm:hidden bg-transparent p-4 gap-4">
        <Button
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-black h-16 rounded-none border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm"
          asChild
        >
          <Link href="/auth">Student Access</Link>
        </Button>
        <Button
          className="flex-1 bg-white hover:bg-slate-100 text-black font-black h-16 rounded-none border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm"
          asChild
        >
          <a href="#features">Explore</a>
        </Button>
      </div>
    </div>
  );
}
