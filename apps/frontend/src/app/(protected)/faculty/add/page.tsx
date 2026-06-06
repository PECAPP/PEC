'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function AddFaculty() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Faculty Added",
      description: "New faculty member has been added successfully.",
    });
    router.push('/faculty');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/faculty">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Faculty</h1>
          <p className="text-muted-foreground">Add a new faculty member to the institution</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Dr. John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+91 98765 43210" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" required />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                  <SelectItem value="ece">Electronics & Communication</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                  <SelectItem value="ce">Civil Engineering</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="associate">Associate Professor</SelectItem>
                  <SelectItem value="assistant">Assistant Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" placeholder="e.g., Machine Learning, VLSI Design" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" placeholder="10" required />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="space-y-2">
          <Label htmlFor="qualifications">Qualifications</Label>
          <Textarea
            id="qualifications"
            placeholder="Enter qualifications (one per line)&#10;e.g., Ph.D. in Computer Science - IIT Delhi"
            rows={4}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Brief biography of the faculty member..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" variant="gradient" className="flex-1">
            Add Faculty
          </Button>
          <Link href="/faculty" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
