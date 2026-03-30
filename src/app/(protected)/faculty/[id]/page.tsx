'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
;
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Users,
  Award,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const facultyData: Record<string, {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string;
  courses: Array<{ name: string; code: string; students: number }>;
  experience: number;
  qualifications: string[];
  office: string;
  officeHours: string;
  bio: string;
}> = {
  '1': {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@university.edu',
    phone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Head of Department',
    specialization: 'Artificial Intelligence, Machine Learning',
    courses: [
      { name: 'Artificial Intelligence', code: 'CS601', students: 45 },
      { name: 'Machine Learning', code: 'CS602', students: 40 },
      { name: 'Deep Learning', code: 'CS701', students: 35 },
    ],
    experience: 18,
    qualifications: ['Ph.D. in Computer Science - IIT Delhi', 'M.Tech in AI - IIT Bombay', 'B.Tech in CSE - NIT Trichy'],
    office: 'Room 301, CSE Building',
    officeHours: 'Mon, Wed, Fri: 2:00 PM - 4:00 PM',
    bio: 'Dr. Rajesh Kumar is a distinguished Professor with over 18 years of experience in teaching and research. His research interests include Artificial Intelligence, Machine Learning, and Natural Language Processing.',
  },
  '2': {
    name: 'Dr. Priya Menon',
    email: 'priya.menon@university.edu',
    phone: '+91 98765 43211',
    department: 'Electronics & Communication',
    designation: 'Professor & Head of Department',
    specialization: 'VLSI Design, Embedded Systems',
    courses: [
      { name: 'VLSI Design', code: 'EC501', students: 50 },
      { name: 'Embedded Systems', code: 'EC502', students: 45 },
    ],
    experience: 15,
    qualifications: ['Ph.D. in Electronics - IISc Bangalore', 'M.Tech in VLSI - IIT Madras'],
    office: 'Room 201, ECE Building',
    officeHours: 'Tue, Thu: 3:00 PM - 5:00 PM',
    bio: 'Dr. Priya Menon specializes in VLSI Design and has published over 50 research papers in international journals.',
  },
};

export default function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const member = facultyData[id || '1'] || facultyData['1'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/faculty">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
          <p className="text-muted-foreground">{member.designation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card-elevated p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">
                {member.name.split(' ').slice(1).map(n => n[0]).join('')}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{member.name}</h2>
            <p className="text-sm text-primary">{member.designation}</p>
            <p className="text-sm text-muted-foreground">{member.department}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.office}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.officeHours}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{member.experience}</p>
                <p className="text-sm text-muted-foreground">Years Exp.</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{member.courses.length}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
            <p className="text-muted-foreground">{member.bio}</p>
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Specialization</p>
              <p className="text-muted-foreground">{member.specialization}</p>
            </div>
          </div>

          {/* Qualifications */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Award className="w-5 h-5 inline-block mr-2 text-primary" />
              Qualifications
            </h3>
            <ul className="space-y-2">
              {member.qualifications.map((qual, idx) => (
                <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  {qual}
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <BookOpen className="w-5 h-5 inline-block mr-2 text-primary" />
              Current Courses
            </h3>
            <div className="space-y-3">
              {member.courses.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{course.students} students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
