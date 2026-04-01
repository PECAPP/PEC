'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/landingData";

export function FAQSection() {
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 relative border-t-2 border-slate-700 overflow-hidden min-h-screen flex items-center snap-start bg-black">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-40"
          style={{ backgroundImage: `url('/bg-13.png')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

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
            Everything you need to know about getting started with PEC App
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
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
  );
}
