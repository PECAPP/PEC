'use client';
import { Button } from "@pec/ui";


import dynamic from 'next/dynamic';
import { LandingHero } from "@/features/landing/LandingHero";

const FeaturesSection = dynamic(() => import('@/features/landing/FeaturesSection').then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const HowItWorksSection = dynamic(() => import('@/features/landing/HowItWorksSection').then(mod => mod.HowItWorksSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const IntegrationsSection = dynamic(() => import('@/features/landing/IntegrationsSection').then(mod => mod.IntegrationsSection), {
  loading: () => <div className="h-screen bg-black animate-pulse" />,
});

const FAQSection = dynamic(() => import('@/features/landing/FAQSection').then(mod => mod.FAQSection), {
  loading: () => <div className="h-[50vh] bg-black animate-pulse" />,
});

const Footer = dynamic(() => import('@/features/landing/Footer').then(mod => mod.Footer), {
  loading: () => <div className="h-64 bg-black animate-pulse" />,
});

import Link from "next/link";

export function LandingClient() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">

      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsSection />
<FAQSection />
      <Footer />

      {/* GLOBAL MOBILE FIXED BOTTOM BAR - TRANSPARENT FLOATING */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] flex sm:hidden bg-background/80 backdrop-blur-sm border-t border-border p-4 gap-4">
        <Button
          className="flex-1 font-semibold h-12 text-sm rounded-sm"
          asChild
        >
          <Link href="/auth">Student Access</Link>
        </Button>
        <Button
          variant="outline"
          className="flex-1 font-semibold h-12 text-sm rounded-sm"
          asChild
        >
          <a href="#features">Explore</a>
        </Button>
      </div>
    </div>
  );
}
