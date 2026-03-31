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

const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then(mod => mod.PricingSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => mod.FAQSection), {
  loading: () => <div className="h-[50vh] bg-black animate-pulse" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer), {
  loading: () => <div className="h-64 bg-black animate-pulse" />,
});

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
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
