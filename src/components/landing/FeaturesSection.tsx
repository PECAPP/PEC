'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { features, rolesData } from "@/data/landingData";

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <>
      {/* Why PEC Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[50vh] flex items-center snap-start">
        <div className="absolute inset-0 z-0 bg-orange-600" />
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              Why <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">PEC</span>
            </h2>
            <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
              The all-in-one platform trusted by leading institutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mt-12 relative">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-none border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/30" />
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-none border border-white/20 bg-black/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/80 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-15.png')` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: "'Monument Extended', serif" }}>
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Tailored for Every User</span>
            </h2>
            <p className="text-lg text-white/90 font-medium max-w-2xl mx-auto">
              Each stakeholder gets a personalized dashboard with features relevant to their role.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rolesData.map((roleData, index) => (
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
    </>
  );
}
