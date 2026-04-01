'use client';

import { motion } from "framer-motion";
import { Cloud, Server, Cpu, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center snap-start">
      <div className="absolute inset-0 z-0 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-40"
          style={{ backgroundImage: `url('/bg-8.png')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <svg className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none text-white z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor">
         <path d="M100 0 L80 0 L80 20 L50 20 L50 50" strokeWidth="0.5"/>
         <circle cx="50" cy="50" r="2" fill="currentColor"/>
         <circle cx="80" cy="20" r="2" fill="currentColor"/>
      </svg>
      <div className="absolute top-10 left-10 opacity-20 z-0">
         <div className="flex gap-2">
            <div className="w-2 h-2 bg-white rounded-none"/>
            <div className="w-2 h-2 bg-white rounded-none"/>
            <div className="w-2 h-2 bg-transparent border border-white rounded-none"/>
         </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-sky-600 mb-4 neo-brutal-shadow">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-sky-400">Integrations</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Connect With Your Tools</span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Seamlessly integrate with your existing systems and third-party services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Cloud,
              title: "Google Workspace",
              description: "Sync contacts, calendars, and documents automatically",
            },
            {
              icon: Server,
              title: "Microsoft 365",
              description: "Native integration with Teams and OneDrive",
            },
            {
              icon: Cpu,
              title: "REST API",
              description: "Full-featured API for custom integrations",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${
                idx === 0 ? 'bg-blue-900/40 border-blue-400' :
                idx === 1 ? 'bg-sky-800/40 border-sky-400' :
                'bg-cyan-900/40 border-cyan-400'
              } border-2 rounded-none p-8 hover:shadow-none neo-brutal-shadow transition-all duration-300 group cursor-default`}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className={`w-12 h-12 rounded-none ${
                    idx === 0 ? 'bg-black border-blue-400' :
                    idx === 1 ? 'bg-black border-sky-400' :
                    'bg-black border-cyan-400'
                } border-2 flex items-center justify-center mb-4 neo-brutal-shadow`}
              >
                {item.icon && <item.icon className={`w-6 h-6 ${
                  idx === 0 ? 'text-blue-300' :
                  idx === 1 ? 'text-sky-300' :
                  'text-cyan-300'
                }`} />}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sky-100 text-sm font-medium">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="outline"
            className="rounded-lg border-accent/30 hover:border-accent/60 hover:bg-accent/5"
            asChild
          >
            <a href="#">
              <Code2 className="w-4 h-4 mr-2" />
              View Full API Documentation
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
