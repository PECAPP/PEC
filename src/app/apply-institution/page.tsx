'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
;
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  Lock,
  ArrowLeft,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ApplyInstitution() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Institution Details
    institutionName: '',
    institutionShortName: '',
    institutionType: 'college',
    location: '',
    email: '',
    phone: '',
    website: '',
    
    // Admin Details
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authClient.signup({
        email: formData.adminEmail,
        password: formData.adminPassword,
        name: formData.adminName,
        role: 'college_admin',
      });

      setSubmitted(true);
      toast.success('Application submitted successfully!');
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      if (error.code === '({} as any)/email-already-in-use') {
        toast.error('Email already registered');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to join PEC. Our team will review your application and get back to you within 24-48 hours.
          </p>
          <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email at <strong className="text-foreground">{formData.adminEmail}</strong> once your institution is approved.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-xl font-bold text-foreground">Apply as Institution</span>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="card-elevated p-8 rounded-2xl"
        >
          <motion.div variants={item} className="mb-8">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Join PEC
            </h1>
            <p className="text-muted-foreground">
              Fill out the form below to apply. Our team will review and get back to you within 48 hours.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Institution Details */}
            <motion.div variants={item}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                Institution Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={(e) => handleChange('institutionName', e.target.value)}
                    placeholder="e.g., Punjab Engineering College"
                  />
                </div>
                <div>
                  <Label htmlFor="institutionShortName">Short Name *</Label>
                  <Input
                    id="institutionShortName"
                    required
                    value={formData.institutionShortName}
                    onChange={(e) => handleChange('institutionShortName', e.target.value)}
                    placeholder="e.g., PEC"
                  />
                </div>
                <div>
                  <Label htmlFor="institutionType">Institution Type *</Label>
                  <Select
                    value={formData.institutionType}
                    onValueChange={(value) => handleChange('institutionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="institute">Institute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="City, State, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Institution Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@institution.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 xxx xxx xxxx"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website (Optional)
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://www.institution.edu"
                  />
                </div>
              </div>
            </motion.div>

            {/* Admin Details */}
            <motion.div variants={item}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Admin Account Details
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will be your login credentials as the College Admin
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="adminName">Your Full Name *</Label>
                  <Input
                    id="adminName"
                    required
                    value={formData.adminName}
                    onChange={(e) => handleChange('adminName', e.target.value)}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="adminEmail">Your Email Address *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    placeholder="admin@institution.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password *
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    required
                    value={formData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <Label htmlFor="adminConfirmPassword">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Confirm Password *
                  </Label>
                  <Input
                    id="adminConfirmPassword"
                    type="password"
                    required
                    value={formData.adminConfirmPassword}
                    onChange={(e) => handleChange('adminConfirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                disabled={loading}
              >
                Cancel
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By submitting this form, you agree to our Terms of Service and Privacy Policy.
              Your application will be reviewed by our team.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
