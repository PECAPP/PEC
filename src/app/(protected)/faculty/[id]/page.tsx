'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Users,
  Award,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { EmptyState } from '@/components/common/AsyncState';

export default function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [facultyRes, coursesRes] = await Promise.all([
          api.get('/users', { params: { role: 'faculty', limit: 200, offset: 0 } }),
          api.get('/courses', { params: { facultyId: id, limit: 200, offset: 0 } }),
        ]);

        const facultyList = extractData<any[]>(facultyRes) || [];
        const found =
          facultyList.find((item: any) => item.id === id || item.uid === id) || null;

        setMember(found);
        setCourses(extractData<any[]>(coursesRes) || []);
      } catch (error) {
        console.error('Error loading faculty profile:', error);
        setMember(null);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const initials = useMemo(() => {
    const name = member?.fullName || member?.name || '';
    return name
      .split(' ')
      .slice(1)
      .map((n: string) => n[0])
      .join('');
  }, [member]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <EmptyState
        title="Faculty not found"
        description="We couldn't locate this faculty profile."
      />
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">{member.fullName || member.name}</h1>
          <p className="text-muted-foreground">{member.designation || 'Faculty'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card-elevated p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">
                {initials || (member.fullName || member.name || '?')[0]}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{member.fullName || member.name}</h2>
            <p className="text-sm text-primary">{member.designation || 'Faculty'}</p>
            <p className="text-sm text-muted-foreground">{member.department || 'Department'}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.office || 'Office details pending'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.officeHours || 'Office hours pending'}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{member.experience ?? '—'}</p>
                <p className="text-sm text-muted-foreground">Years Exp.</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
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
            <p className="text-muted-foreground">{member.bio || 'Faculty biography is not available yet.'}</p>
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Specialization</p>
              <p className="text-muted-foreground">{member.specialization || 'Not specified'}</p>
            </div>
          </div>

          {/* Qualifications */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Award className="w-5 h-5 inline-block mr-2 text-primary" />
              Qualifications
            </h3>
            <p className="text-sm text-muted-foreground">
              {member.qualifications?.length ? member.qualifications.join(', ') : 'Qualifications not shared yet.'}
            </p>
          </div>

          {/* Courses */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <BookOpen className="w-5 h-5 inline-block mr-2 text-primary" />
              Current Courses
            </h3>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">{course.name}</p>
                      <p className="text-sm text-muted-foreground">{course.code}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{course?._count?.enrollments ?? course?.enrolledStudents ?? 0} students</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
