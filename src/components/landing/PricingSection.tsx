'use client';

import { motion } from "framer-motion";
import { CheckCircle, X, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "Forever",
    gradient: "from-lime-700 to-emerald-700",
    features: [
      { name: "Students", value: "500" },
      { name: "Storage", value: "5 GB" },
      { name: "Admin accounts", value: "2" },
      { name: "Student information", included: true },
      { name: "Attendance tracking", included: true },
      { name: "Grade management", included: true },
      { name: "Email support", included: true },
    ]
  },
  {
    name: "Professional",
    price: "₹1,300",
    period: "/month",
    badge: "POPULAR",
    gradient: "from-teal-600 to-cyan-600",
    features: [
      { name: "Students", value: "10,000" },
      { name: "Storage", value: "500 GB" },
      { name: "Admin accounts", value: "10" },
      { name: "All Starter features", included: true },
      { name: "Placement portal", included: true },
      { name: "Resume builder", included: true },
      { name: "Finance management", included: true },
      { name: "Priority support", included: true },
      { name: "Custom integrations", included: true },
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Contact sales",
    gradient: "from-emerald-700 to-green-700",
    features: [
      { name: "Students", value: "Unlimited" },
      { name: "Storage", value: "Unlimited" },
      { name: "Admin accounts", value: "Unlimited" },
      { name: "All features", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "SLA guarantee (99.9%)", included: true },
      { name: "On-premise deployment", included: true },
      { name: "Advanced analytics", included: true },
    ]
  },
];

const tableFeatures = [
  { name: "Students", starter: "500", pro: "10,000", enterprise: "Unlimited" },
  { name: "Storage", starter: "5 GB", pro: "500 GB", enterprise: "Unlimited" },
  { name: "Admin accounts", starter: "2", pro: "10", enterprise: "Unlimited" },
  { name: "Student information", starter: true, pro: true, enterprise: true },
  { name: "Attendance tracking", starter: true, pro: true, enterprise: true },
  { name: "Grade management", starter: true, pro: true, enterprise: true },
  { name: "Placement portal", starter: false, pro: true, enterprise: true },
  { name: "Resume builder", starter: false, pro: true, enterprise: true },
  { name: "Finance management", starter: false, pro: true, enterprise: true },
  { name: "Email support", starter: true, pro: true, enterprise: true },
  { name: "Priority support", starter: false, pro: true, enterprise: true },
  { name: "Dedicated account manager", starter: false, pro: false, enterprise: true },
  { name: "Custom integrations", starter: false, pro: true, enterprise: true },
  { name: "SLA guarantee (99.9%)", starter: false, pro: false, enterprise: true },
  { name: "On-premise deployment", starter: false, pro: false, enterprise: true },
  { name: "Advanced analytics", starter: false, pro: false, enterprise: true },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative border-t border-neutral-800 overflow-hidden min-h-screen flex items-center snap-start">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#047857" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#134e4a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#042f2e" stopOpacity="0.6" />
            </linearGradient>
            <radialGradient id="gradient3">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 200 Q 300 100, 600 200 T 1200 200 L 1200 0 L 0 0 Z" fill="url(#gradient1)" />
          <path d="M0 400 Q 400 300, 800 400 T 1600 400 L 1600 0 L 0 0 Z" fill="url(#gradient2)" opacity="0.8" />
          <ellipse cx="30%" cy="40%" rx="500" ry="600" fill="url(#gradient3)" />
          <ellipse cx="80%" cy="60%" rx="600" ry="500" fill="url(#gradient3)" />
          <ellipse cx="50%" cy="80%" rx="700" ry="400" fill="url(#gradient3)" opacity="0.6" />
          <path d="M1920 600 Q 1600 700, 1200 600 T 0 600 L 0 1080 L 1920 1080 Z" fill="url(#gradient1)" opacity="0.6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-black border-2 border-zinc-600 mb-4 neo-brutal-shadow">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Transparent Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Monument Extended', serif" }}>
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">Plans for Every Institution</span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Mobile Cards */}
        <div className="lg:hidden max-w-2xl mx-auto mb-8 space-y-6 px-4">
          {plans.map((plan, idx) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="relative">
              {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-black text-xs font-black rounded-full z-10">{plan.badge}</div>}
              <div className={`bg-gradient-to-br ${plan.gradient} rounded-2xl p-6 shadow-2xl`}>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-black text-white mb-1">{plan.price}</div>
                  <div className="text-sm text-white/90 font-medium">{plan.period}</div>
                </div>
                <Button asChild size="lg" className="w-full mb-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold border-2 border-white/40 rounded-xl py-6">
                  <Link href="/onboarding" className="flex items-center justify-center gap-2">Get Started <ArrowRight className="w-5 h-5" /></Link>
                </Button>
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                      <span className="text-sm font-semibold text-white">{feature.name}</span>
                      {feature.value ? <span className="text-sm font-black text-white">{feature.value}</span> : feature.included ? <CheckCircle className="w-5 h-5 text-white flex-shrink-0" /> : <X className="w-5 h-5 text-white/40 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block max-w-7xl mx-auto mb-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-lg rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b-2 border-emerald-900/50">
                  <th className="text-left py-5 px-4 text-sm font-bold text-white bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950 border-r border-emerald-800/30">Feature</th>
                  {plans.map((plan, i) => (
                    <th key={plan.name} className={`py-5 px-4 text-center bg-gradient-to-br ${plan.gradient} rounded-t-xl min-w-[140px] relative`}>
                      {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-full whitespace-nowrap">POPULAR</div>}
                      <div className="text-white">
                        <div className="text-sm font-bold mb-1">{plan.name}</div>
                        <div className="text-3xl font-black">{plan.price}</div>
                        <div className="text-xs opacity-90 font-medium">{plan.period}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableFeatures.map((feature, idx) => (
                  <tr key={feature.name} className={idx % 2 === 0 ? "bg-emerald-900/20" : "bg-emerald-950/40"}>
                    <td className="py-4 px-4 text-sm font-semibold text-white border-r border-emerald-800/30">{feature.name}</td>
                    {[feature.starter, feature.pro, feature.enterprise].map((val, i) => (
                      <td key={i} className="py-4 px-4 text-center">
                        {typeof val === 'string' ? <span className="text-sm font-bold text-white">{val}</span> : val ? <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" /> : <X className="w-6 h-6 text-gray-600 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-emerald-950/60">
                  <td className="py-5 px-4 bg-emerald-950/60 border-r border-emerald-800/30"></td>
                  {plans.map((plan, i) => (
                    <td key={i} className="py-5 px-4">
                      <Button asChild size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-6 rounded-lg">
                        <Link href="/onboarding" className="flex items-center justify-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600">✓ Save 20% with annual billing</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
