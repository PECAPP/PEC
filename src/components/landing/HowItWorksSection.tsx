'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import { stepsData } from "@/data/landingData";
import { Button } from "@/components/ui/button";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
      <div className="absolute inset-0 z-0 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
          style={{ backgroundImage: `url('/bg-10.png')` }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-yellow-600 mb-6 neo-brutal-shadow">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Quick Setup</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">Get Started in 3 Easy Steps</span>
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            From signup to activation in under 10 minutes. 100% Free for Students.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/20 via-yellow-500/40 to-transparent hidden md:block" />
          <div className="space-y-4 md:space-y-8">
            {stepsData.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative flex gap-3 md:gap-8 group"
              >
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-none bg-white border-2 border-black flex items-center justify-center neo-brutal-shadow relative z-10 text-black"
                  >
                    <span className="text-xl md:text-2xl font-bold">{step.step}</span>
                  </motion.div>
                  {i < 2 && (
                    <div className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 w-0.5 h-4 md:h-8 bg-yellow-500/20 md:block" />
                  )}
                </div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className={`flex-1 ${step.bgColor} border-2 ${step.borderColor} rounded-none p-4 md:p-8 hover:shadow-none neo-brutal-shadow transition-all duration-300`}
                >
                  <div className="flex items-start gap-4 mb-3 md:mb-4">
                   <div className={`p-3 bg-black border-2 ${step.borderColor} neo-brutal-shadow`}>
                      <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">{step.title}</h3>
                      <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                    {step.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button size="lg" asChild className="neo-brutal-btn bg-white text-black hover:bg-yellow-50 border-2 border-black px-10 py-6">
            <Link href="/auth" className="flex items-center gap-2">
              Explore PEC App
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <p className="text-sm text-white/40 mt-4 uppercase tracking-widest font-bold">
            100% Free for PEC Community
          </p>
        </motion.div>
      </div>
    </section>
  );
}
