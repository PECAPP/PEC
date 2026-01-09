import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  User,
  FileText,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AddOrganization() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Organization Added',
      description: 'The organization has been successfully registered.',
    });
    
    navigate('/admin/organizations');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/organizations')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Organization</h1>
          <p className="text-muted-foreground">Register a new university or institution</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Info */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Organization Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input id="name" placeholder="e.g., Indian Institute of Technology, Delhi" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="institute">Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="affiliation">Affiliation</Label>
              <Input id="affiliation" placeholder="e.g., UGC, AICTE" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea id="address" placeholder="Full address including city, state, PIN code" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="e.g., New Delhi" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select defaultValue="india">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Official Email *</Label>
              <Input id="email" type="email" placeholder="admin@university.edu" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="+91 11 2659 1000" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://university.edu" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input id="fax" placeholder="+91 11 2659 1001" className="mt-1" />
            </div>
          </div>
        </motion.div>

        {/* Admin Info */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">College Administrator</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input id="admin-name" placeholder="e.g., Dr. Rajesh Kumar" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="admin-designation">Designation *</Label>
              <Input id="admin-designation" placeholder="e.g., Director of Academic Affairs" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="admin-email">Email *</Label>
              <Input id="admin-email" type="email" placeholder="admin@university.edu" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="admin-phone">Phone *</Label>
              <Input id="admin-phone" type="tel" placeholder="+91 98765 43210" className="mt-1" required />
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Subscription Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan">Plan *</Label>
              <Select defaultValue="enterprise">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billing">Billing Cycle</Label>
              <Select defaultValue="annual">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={item} className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/organizations')}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Add Organization
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default AddOrganization;
