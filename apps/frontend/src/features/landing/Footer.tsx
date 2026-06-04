'use client';

import { motion } from "framer-motion";
import Link from 'next/link';
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import GradualBlur from "@/components/ui/GradualBlur";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features", aria: "View all features" },
      { label: "Dashboard", href: "/dashboard", aria: "Access dashboard" },
      { label: "Integrations", href: "#integrations", aria: "View integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog", aria: "Read our blog" },
      { label: "Contact", href: "/contact", aria: "Contact us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy", aria: "Privacy policy" },
      { label: "Terms", href: "/terms", aria: "Terms of service" },
      { label: "GDPR", href: "/gdpr", aria: "GDPR compliance" },
      { label: "Cookies", href: "/cookies", aria: "Cookie policy" },
    ],
  },
];

const socials = [
  { icon: Twitter, name: "Twitter", url: "#", ariaLabel: "Follow us on Twitter" },
  { icon: Linkedin, name: "LinkedIn", url: "#", ariaLabel: "Follow us on LinkedIn" },
  { icon: Facebook, name: "Facebook", url: "#", ariaLabel: "Follow us on Facebook" },
  { icon: Instagram, name: "Instagram", url: "#", ariaLabel: "Follow us on Instagram" },
];

export function Footer() {
  return (
    <>
      <footer className="relative text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 overflow-hidden snap-start">
        <div className="absolute inset-0 z-0 bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-50"
            style={{ backgroundImage: `url('/bg-12.png')` }}
          />
          <div className="absolute inset-0 bg-black/90" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link href="/">
                <div className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-white uppercase tracking-tighter">PEC App</span>
                </div>
              </Link>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs transition-colors hover:text-white">
                The absolute orchestration platform for your academic life. Empowering the next generation of students.
              </p>
            </motion.div>

            {footerLinks.map((col) => (
              <motion.div key={col.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <h4 className="font-semibold text-white mb-6 text-base">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <motion.a href={link.href} aria-label={link.aria} className="text-sm text-white/60 hover:text-white transition-all duration-300 inline-block" whileHover={{ x: 4 }}>
                        {link.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/50">© 2025 PEC App. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {socials.map((social) => (
                <motion.a key={social.name} href={social.url} aria-label={social.ariaLabel} className="text-white/60 hover:text-white transition-all duration-300" whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }}>
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>

      <GradualBlur
        target="page"
        position="bottom"
        height="4rem"
        strength={1.5}
        divCount={4}
        curve="bezier"
        exponential={false}
        opacity={0.8}
        zIndex={500}
      />
    </>
  );
}
