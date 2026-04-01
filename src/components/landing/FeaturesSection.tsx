'use client';

import { motion } from "framer-motion";
import { rolesData } from "@/data/landingData";

export function FeaturesSection() {
  return (
    <>

      {/* Role-Based Access */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-60"
            style={{ backgroundImage: `url('/bg-9.png')` }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
              Built for <span className="text-yellow-400">Students</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto font-medium">
              A comprehensive institutional ecosystem designed to orchestrate the modern campus life-cycle.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {rolesData.map((role) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className={`p-10 border-2 ${role.borderColor} ${role.bgColor} relative group overflow-hidden neo-brutal-shadow hover:shadow-[8px_8px_0px_0px_white] transition-all duration-300`}
              >
                {/* Animated Background Pulse */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 border-2 ${role.borderColor} flex items-center justify-center mb-8 bg-black/40 group-hover:bg-black/60 transition-colors`}>
                    <role.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6 text-white uppercase tracking-wider font-monument">{role.role}</h3>
                  <ul className="space-y-4">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 text-white/90 group-hover:text-white transition-colors">
                        <div className={`w-2 h-2 rounded-none bg-white opacity-40 group-hover:opacity-100 transition-all duration-300 ${i === 0 ? 'scale-150 animate-pulse' : ''}`} />
                        <span className="text-lg font-medium leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
