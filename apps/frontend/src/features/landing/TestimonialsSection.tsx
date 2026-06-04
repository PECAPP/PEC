'use client';

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/landingData";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black snap-start">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-40"
          style={{ backgroundImage: `url('/bg-14.png')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-black mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">Real Results</span>
          </h2>
          <p className="text-lg text-white font-bold max-w-3xl mx-auto uppercase tracking-wide opacity-60">
            Join 5,000+ Students Excelling Daily
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.slice(0, 4).map((testimonial, idx) => {
            const colors = [
              { bg: 'bg-yellow-400', border: 'border-yellow-400', shadow: 'shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]', text: 'text-black' },
              { bg: 'bg-green-400', border: 'border-green-400', shadow: 'shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]', text: 'text-black' },
              { bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]', text: 'text-white' },
              { bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]', text: 'text-white' }
            ];
            const color = colors[idx];
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`${color.bg} border-4 border-black rounded-none p-6 ${color.shadow} transition-all duration-200 cursor-pointer`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-black" fill="black" />
                  ))}
                </div>
                
                <p className={`${color.text} font-bold text-sm mb-6 leading-relaxed`}>
                  &quot;{testimonial.quote.slice(0, 150)}&quot;...
                </p>
                
                <div className="inline-block px-3 py-2 bg-black border-2 border-black rounded-none mb-4">
                  <span className="text-white font-black text-xs uppercase">{testimonial.savedHours}</span>
                </div>
                
                <div className={`${color.text} border-t-4 border-black pt-4`}>
                  <h4 className="font-black text-base mb-1">{testimonial.name}</h4>
                  <p className="font-bold text-xs opacity-80">{testimonial.designation}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
