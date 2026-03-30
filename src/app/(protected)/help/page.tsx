'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Security > Change Password. Enter your current password and your new password twice to confirm. If you forgot your password, use the "Forgot Password" link on the login page.',
  },
  {
    question: 'How can I view my attendance records?',
    answer: 'Navigate to the Attendance section from the sidebar. You can view your attendance percentage by subject, see detailed records, and download attendance reports. For faculty, you can mark attendance by selecting your course and clicking "Mark Attendance".',
  },
  {
    question: 'How do I apply for placement opportunities?',
    answer: 'Visit the Placements section to view available job listings. Click on any job to see details and use the "Apply Now" button to submit your details along with your resume.',
  },
  {
    question: 'How can I report a hostel maintenance issue?',
    answer: 'Go to the Hostel Issues section in the sidebar. Click on "Report Issue", select a category (Plumbing, Electrical, etc.), describe your problem, and submit. You can track the status of your request and message the maintenance team directly.',
  },
  {
    question: 'How do I order from the Night Canteen?',
    answer: 'Navigate to the Night Canteen section. Browse the menu, add items to your cart, and place your order. You can track your order status in real-time and view your order history.',
  },
  {
    question: 'How do I pay my semester fees?',
    answer: 'Navigate to Finance > Fee Payment. View your pending fees and click "Pay Now". You can pay via credit/debit card, net banking, or UPI. A receipt will be generated automatically after a successful transaction.',
  },
  {
    question: 'How can I use the AI Resume Analyzer?',
    answer: 'Go to Resume Builder > AI Analyzer. Upload your PDF resume, and the system will provide detailed feedback, score your resume, and suggest improvements based on industry standards.',
  },
  {
    question: 'How can I contact my faculty?',
    answer: 'Go to Courses and select the relevant course. You\'ll find the faculty details and contact information there. You can also send messages through the platform\'s messaging system.',
  },
];

const helpCategories = [
  { icon: BookOpen, label: 'Getting Started', count: 12, path: '/help/getting-started' },
  { icon: Users, label: 'Account & Profile', count: 8, path: '/help/account-profile' },
  { icon: FileText, label: 'Academics', count: 15, path: '/help/academics' },
  { icon: Settings, label: 'Settings & Privacy', count: 6, path: '/help/settings-privacy' },
];

const resources = [
  { icon: Video, label: 'Video Tutorials', description: 'Watch step-by-step guides', link: '#' },
  { icon: FileText, label: 'Documentation', description: 'Read detailed documentation', link: '#' },
  { icon: MessageCircle, label: 'Community Forum', description: 'Ask questions & get answers', link: '#' },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">How can we help?</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search our help center or browse categories below
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-xl mx-auto mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-12 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpCategories.map((category, index) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={category.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                        <category.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="font-medium">{category.label}</p>
                        <p className="text-sm text-muted-foreground">{category.count} articles</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Resources & Contact */}
        <div className="space-y-6">
          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Additional help materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources.map((resource) => (
                <a
                  key={resource.label}
                  href={resource.link}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <resource.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{resource.label}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Can't find what you're looking for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@unierp.edu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-xs text-muted-foreground">+91 1800-XXX-XXXX</p>
                </div>
              </div>
              <Button className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
