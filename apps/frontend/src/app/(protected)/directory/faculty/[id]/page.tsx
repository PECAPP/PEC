'use client';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, formatDate, AppShellSkeleton } from "@pec/ui";
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, BookOpen, Users, Award, MapPin,
  Trophy, Mic2, Briefcase, FileText, Quote, Calendar, Building2, ExternalLink
} from 'lucide-react';

import api from "@pec/api";
import { extractData } from '@/lib/utils';
import { EmptyState } from '@/components/common/AsyncState';
import { FullProfile } from '../../../faculty-bio-system/types';

export default function FacultyDetail() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [facultyBioRes, coursesRes] = await Promise.all([
          api.get(`/faculty-bio-system/${id}`),
          api.get('/courses', { params: { facultyId: id, limit: 200, offset: 0 } }),
        ]);

        // The endpoint returns the full profile payload
        setProfile(facultyBioRes.data || null);
        const extractedCourses = extractData<any[]>(coursesRes.data);
        setCourses(Array.isArray(extractedCourses) ? extractedCourses : []);
      } catch (error) {
        console.error('Error loading faculty profile:', error);
        setProfile(null);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const member = profile?.faculty;

  const initials = useMemo(() => {
    const name = member?.name || member?.employeeId || '';
    return name
      .split(' ')
      .slice(1)
      .map((n: string) => n[0])
      .join('') || (name[0] || '?');
  }, [member]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <AppShellSkeleton />
      </div>
    );
  }

  if (!member || !profile) {
    return (
      <EmptyState
        title="Faculty not found"
        description="We couldn't locate this faculty profile."
      />
    );
  }

  const stats = profile.stats || {
    totalPublications: 0,
    totalAwards: 0,
    totalConferences: 0,
    totalConsultations: 0,
    totalCitations: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 z-10 relative">
        <Link href="/directory/faculty">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
          <p className="text-muted-foreground">{member.designation || 'Faculty'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Sidebar */}
        <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 lg:sticky lg:top-24 self-start">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center  mb-4">
              <span className="text-3xl font-bold text-primary">
                {initials}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{member.name}</h2>
            <p className="text-sm text-primary">{member.designation || 'Faculty'}</p>
            <p className="text-sm text-muted-foreground">{member.department || 'Department'}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground break-all">{member.email || 'No email provided'}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.department || 'Department'}</span>
            </div>
            {member.specialization && (
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{member.specialization}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPublications}</p>
                <p className="text-xs text-muted-foreground">Publications</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'publications', label: 'Publications', icon: BookOpen },
                { id: 'awards', label: 'Awards', icon: Trophy },
                { id: 'conferences', label: 'Conferences', icon: Mic2 },
                { id: 'consultations', label: 'Consulting', icon: Briefcase },
              ].map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-border/40 data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-3 text-[10px] md:text-xs font-bold  transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 space-y-6">
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="m-0 space-y-6">
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 text-center">
                    <BookOpen className="w-6 h-6  mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.totalPublications}</p>
                    <p className="text-xs text-muted-foreground">Papers</p>
                  </div>
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 text-center">
                    <Quote className="w-6 h-6  mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.totalCitations}</p>
                    <p className="text-xs text-muted-foreground">Citations</p>
                  </div>
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 text-center">
                    <Trophy className="w-6 h-6  mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.totalAwards}</p>
                    <p className="text-xs text-muted-foreground">Awards</p>
                  </div>
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 text-center">
                    <Briefcase className="w-6 h-6  mb-2 text-primary" />
                    <p className="text-xl font-bold">{stats.totalConsultations}</p>
                    <p className="text-xs text-muted-foreground">Consults</p>
                  </div>
                </div>

                <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {member.bio || 'Biography details are not available yet.'}
                  </p>
                </div>

                <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    <Award className="w-5 h-5 inline-block mr-2 text-primary" />
                    Qualifications
                  </h3>
                  <p className="text-muted-foreground">
                    {member.qualifications || 'Qualifications not shared yet.'}
                  </p>
                </div>

                <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    <BookOpen className="w-5 h-5 inline-block mr-2 text-primary" />
                    Current Courses
                  </h3>
                  {Array.isArray(courses) && courses.length > 0 ? (
                    <div className="space-y-3">
                      {courses.map((course, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-secondary/20 flex items-center justify-between bg-secondary/30">
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
                  )}
                </div>
              </TabsContent>

              {/* PUBLICATIONS TAB */}
              <TabsContent value="publications" className="m-0 space-y-4">
                {(profile.publications || []).length === 0 ? (
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-12 text-center">
                    <BookOpen className="w-12 h-12  mb-4 opacity-20" />
                    <p className="text-muted-foreground">No publications listed.</p>
                  </div>
                ) : (
                  (profile.publications || []).map((pub, idx) => (
                    <motion.div
                      key={pub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{pub.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                            {pub.journal && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {pub.journal}
                              </span>
                            )}
                            {pub.conference && (
                              <span className="flex items-center gap-1">
                                <Mic2 className="w-3 h-3" /> {pub.conference}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {pub.year}
                            </span>
                            {pub.citations > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Quote className="w-3 h-3 mr-1" /> {pub.citations} citations
                              </Badge>
                            )}
                          </div>
                          {pub.abstract && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                              {pub.abstract}
                            </p>
                          )}
                          {pub.coAuthors && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium text-foreground">Co-authors:</span> {pub.coAuthors}
                            </p>
                          )}
                        </div>
                        {pub.url && (
                          <div className="flex-shrink-0">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
                  ))
                )}
              </TabsContent>

              {/* AWARDS TAB */}
              <TabsContent value="awards" className="m-0 space-y-4">
                {(profile.awards || []).length === 0 ? (
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-12 text-center">
                    <Trophy className="w-12 h-12  mb-4 opacity-20" />
                    <p className="text-muted-foreground">No awards listed.</p>
                  </div>
                ) : (
                  (profile.awards || []).map((award, idx) => (
                    <motion.div
                      key={award.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Award className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{award.title}</h3>
                            <Badge variant="outline" className="text-xs ">
                              {award.category}
                            </Badge>
                          </div>
                          {award.description && (
                            <p className="text-sm text-muted-foreground mt-2">{award.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                            {award.awardedBy && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {award.awardedBy}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {award.year}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* CONFERENCES TAB */}
              <TabsContent value="conferences" className="m-0 space-y-4">
                {(profile.conferences || []).length === 0 ? (
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-12 text-center">
                    <Mic2 className="w-12 h-12  mb-4 opacity-20" />
                    <p className="text-muted-foreground">No conferences listed.</p>
                  </div>
                ) : (
                  (profile.conferences || []).map((conf, idx) => (
                    <motion.div
                      key={conf.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5 border-l-4 border-l-primary"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="font-semibold text-lg">{conf.name}</h3>
                          {conf.role && (
                            <Badge variant="secondary" className="text-xs ">
                              {conf.role}
                            </Badge>
                          )}
                        </div>
                        {conf.presentationTitle && (
                          <p className="text-sm font-medium text-primary mt-1">
                            "{conf.presentationTitle}"
                          </p>
                        )}
                        {conf.description && (
                          <p className="text-sm text-muted-foreground mt-2">{conf.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground bg-muted/30 p-2 rounded-sm">
                          {conf.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {conf.location}
                            </span>
                          )}
                          {conf.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 
                              {formatDate(conf.startDate)}
                              {conf.endDate && ` - ${formatDate(conf.endDate)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* CONSULTATIONS TAB */}
              <TabsContent value="consultations" className="m-0 space-y-4">
                {(profile.consultations || []).length === 0 ? (
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm p-12 text-center">
                    <Briefcase className="w-12 h-12  mb-4 opacity-20" />
                    <p className="text-muted-foreground">No consultations listed.</p>
                  </div>
                ) : (
                  (profile.consultations || []).map((consult, idx) => (
                    <motion.div
                      key={consult.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Briefcase className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">{consult.organization}</h3>
                            <Badge
                              variant={
                                consult.status === 'active'
                                  ? 'default'
                                  : consult.status === 'ongoing'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="text-xs "
                            >
                              {consult.status}
                            </Badge>
                          </div>
                          {consult.description && (
                            <p className="text-sm text-muted-foreground mt-3">{consult.description}</p>
                          )}
                          <div className="p-2 rounded-lg border border-border/40 inline-flex flex-wrap items-center gap-3 mt-4 text-sm font-mono bg-primary/5 text-primary">
                            {consult.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> From{' '}
                                {formatDate(consult.startDate)}
                              </span>
                            )}
                            {consult.endDate && (
                              <span className="flex items-center gap-1">
                                — To {formatDate(consult.endDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
