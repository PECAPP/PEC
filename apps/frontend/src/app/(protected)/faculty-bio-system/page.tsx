'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Trophy,
  Mic2,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Check,
  ExternalLink,
  Quote,
  Calendar,
  MapPin,
  Building2,
  Award,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

interface Publication {
  id: string;
  facultyId: string;
  title: string;
  journal: string | null;
  conference: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  citations: number;
  coAuthors: string | null;
  createdAt: string;
}

interface Award {
  id: string;
  facultyId: string;
  title: string;
  description: string | null;
  awardedBy: string | null;
  year: number;
  category: string;
  createdAt: string;
}

interface Conference {
  id: string;
  facultyId: string;
  name: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  role: string | null;
  presentationTitle: string | null;
  description: string | null;
  createdAt: string;
}

interface Consultation {
  id: string;
  facultyId: string;
  organization: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

interface FacultyProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  employeeId: string;
  department: string;
  designation: string;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  bio: string | null;
}

interface FullProfile {
  faculty: FacultyProfile | null;
  publications: Publication[];
  awards: Award[];
  conferences: Conference[];
  consultations: Consultation[];
  stats: {
    totalPublications: number;
    totalAwards: number;
    totalConferences: number;
    totalConsultations: number;
    totalCitations: number;
  };
}

const emptyPublicationForm = {
  title: '',
  journal: '',
  conference: '',
  year: new Date().getFullYear(),
  doi: '',
  url: '',
  abstract: '',
  citations: 0,
  coAuthors: '',
};

const emptyAwardForm = {
  title: '',
  description: '',
  awardedBy: '',
  year: new Date().getFullYear(),
  category: 'academic',
};

const emptyConferenceForm = {
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  role: 'presenter',
  presentationTitle: '',
  description: '',
};

const emptyConsultationForm = {
  organization: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'active',
};

export default function FacultyBioSystemPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [showPublicationDialog, setShowPublicationDialog] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [publicationForm, setPublicationForm] = useState(emptyPublicationForm);
  const [savingPublication, setSavingPublication] = useState(false);

  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [awardForm, setAwardForm] = useState(emptyAwardForm);
  const [savingAward, setSavingAward] = useState(false);

  const [showConferenceDialog, setShowConferenceDialog] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [conferenceForm, setConferenceForm] = useState(emptyConferenceForm);
  const [savingConference, setSavingConference] = useState(false);

  const [showConsultationDialog, setShowConsultationDialog] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [consultationForm, setConsultationForm] = useState(emptyConsultationForm);
  const [savingConsultation, setSavingConsultation] = useState(false);

  const facultyId = (id as string) || user?.uid;

  useEffect(() => {
    if (authLoading) return;
    if (!facultyId) {
      router.replace('/dashboard');
      return;
    }
    fetchFullProfile();
  }, [authLoading, facultyId, router]);

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/faculty-bio-system/${facultyId}`);
      setProfile(data.data);
    } catch (error) {
      console.error('Error fetching faculty profile:', error);
      toast.error('Failed to load faculty profile');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.uid === facultyId;
  const isAdmin = user?.role?.includes('admin');
  const canEdit = isOwner || isAdmin;

  // Publication handlers
  const openCreatePublication = () => {
    setEditingPublication(null);
    setPublicationForm(emptyPublicationForm);
    setShowPublicationDialog(true);
  };

  const openEditPublication = (pub: Publication) => {
    setEditingPublication(pub);
    setPublicationForm({
      title: pub.title,
      journal: pub.journal || '',
      conference: pub.conference || '',
      year: pub.year,
      doi: pub.doi || '',
      url: pub.url || '',
      abstract: pub.abstract || '',
      citations: pub.citations,
      coAuthors: pub.coAuthors || '',
    });
    setShowPublicationDialog(true);
  };

  const handleSavePublication = async () => {
    if (!publicationForm.title) {
      toast.error('Title is required');
      return;
    }

    setSavingPublication(true);
    try {
      const payload = {
        facultyId,
        ...publicationForm,
        journal: publicationForm.journal || null,
        conference: publicationForm.conference || null,
        doi: publicationForm.doi || null,
        url: publicationForm.url || null,
        abstract: publicationForm.abstract || null,
        coAuthors: publicationForm.coAuthors || null,
      };

      if (editingPublication) {
        await api.patch(`/faculty-bio-system/publications/${editingPublication.id}`, payload);
        toast.success('Publication updated');
      } else {
        await api.post('/faculty-bio-system/publications', payload);
        toast.success('Publication added');
      }
      setShowPublicationDialog(false);
      fetchFullProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save publication');
    } finally {
      setSavingPublication(false);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (!confirm('Delete this publication?')) return;
    try {
      await api.delete(`/faculty-bio-system/publications/${id}`);
      toast.success('Publication deleted');
      fetchFullProfile();
    } catch (error) {
      toast.error('Failed to delete publication');
    }
  };

  // Award handlers
  const openCreateAward = () => {
    setEditingAward(null);
    setAwardForm(emptyAwardForm);
    setShowAwardDialog(true);
  };

  const openEditAward = (award: Award) => {
    setEditingAward(award);
    setAwardForm({
      title: award.title,
      description: award.description || '',
      awardedBy: award.awardedBy || '',
      year: award.year,
      category: award.category,
    });
    setShowAwardDialog(true);
  };

  const handleSaveAward = async () => {
    if (!awardForm.title) {
      toast.error('Title is required');
      return;
    }

    setSavingAward(true);
    try {
      const payload = {
        facultyId,
        ...awardForm,
        description: awardForm.description || null,
        awardedBy: awardForm.awardedBy || null,
      };

      if (editingAward) {
        await api.patch(`/faculty-bio-system/awards/${editingAward.id}`, payload);
        toast.success('Award updated');
      } else {
        await api.post('/faculty-bio-system/awards', payload);
        toast.success('Award added');
      }
      setShowAwardDialog(false);
      fetchFullProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save award');
    } finally {
      setSavingAward(false);
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm('Delete this award?')) return;
    try {
      await api.delete(`/faculty-bio-system/awards/${id}`);
      toast.success('Award deleted');
      fetchFullProfile();
    } catch (error) {
      toast.error('Failed to delete award');
    }
  };

  // Conference handlers
  const openCreateConference = () => {
    setEditingConference(null);
    setConferenceForm(emptyConferenceForm);
    setShowConferenceDialog(true);
  };

  const openEditConference = (conf: Conference) => {
    setEditingConference(conf);
    setConferenceForm({
      name: conf.name,
      location: conf.location || '',
      startDate: conf.startDate ? new Date(conf.startDate).toISOString().split('T')[0] : '',
      endDate: conf.endDate ? new Date(conf.endDate).toISOString().split('T')[0] : '',
      role: conf.role || 'presenter',
      presentationTitle: conf.presentationTitle || '',
      description: conf.description || '',
    });
    setShowConferenceDialog(true);
  };

  const handleSaveConference = async () => {
    if (!conferenceForm.name) {
      toast.error('Conference name is required');
      return;
    }

    setSavingConference(true);
    try {
      const payload = {
        facultyId,
        ...conferenceForm,
        location: conferenceForm.location || null,
        startDate: conferenceForm.startDate || null,
        endDate: conferenceForm.endDate || null,
        presentationTitle: conferenceForm.presentationTitle || null,
        description: conferenceForm.description || null,
      };

      if (editingConference) {
        await api.patch(`/faculty-bio-system/conferences/${editingConference.id}`, payload);
        toast.success('Conference updated');
      } else {
        await api.post('/faculty-bio-system/conferences', payload);
        toast.success('Conference added');
      }
      setShowConferenceDialog(false);
      fetchFullProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save conference');
    } finally {
      setSavingConference(false);
    }
  };

  const handleDeleteConference = async (id: string) => {
    if (!confirm('Delete this conference?')) return;
    try {
      await api.delete(`/faculty-bio-system/conferences/${id}`);
      toast.success('Conference deleted');
      fetchFullProfile();
    } catch (error) {
      toast.error('Failed to delete conference');
    }
  };

  // Consultation handlers
  const openCreateConsultation = () => {
    setEditingConsultation(null);
    setConsultationForm(emptyConsultationForm);
    setShowConsultationDialog(true);
  };

  const openEditConsultation = (consult: Consultation) => {
    setEditingConsultation(consult);
    setConsultationForm({
      organization: consult.organization,
      description: consult.description || '',
      startDate: consult.startDate ? new Date(consult.startDate).toISOString().split('T')[0] : '',
      endDate: consult.endDate ? new Date(consult.endDate).toISOString().split('T')[0] : '',
      status: consult.status,
    });
    setShowConsultationDialog(true);
  };

  const handleSaveConsultation = async () => {
    if (!consultationForm.organization) {
      toast.error('Organization is required');
      return;
    }

    setSavingConsultation(true);
    try {
      const payload = {
        facultyId,
        ...consultationForm,
        description: consultationForm.description || null,
        startDate: consultationForm.startDate || null,
        endDate: consultationForm.endDate || null,
      };

      if (editingConsultation) {
        await api.patch(`/faculty-bio-system/consultations/${editingConsultation.id}`, payload);
        toast.success('Consultation updated');
      } else {
        await api.post('/faculty-bio-system/consultations', payload);
        toast.success('Consultation added');
      }
      setShowConsultationDialog(false);
      fetchFullProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save consultation');
    } finally {
      setSavingConsultation(false);
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('Delete this consultation?')) return;
    try {
      await api.delete(`/faculty-bio-system/consultations/${id}`);
      toast.success('Consultation deleted');
      fetchFullProfile();
    } catch (error) {
      toast.error('Failed to delete consultation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = profile?.stats || {
    totalPublications: 0,
    totalAwards: 0,
    totalConferences: 0,
    totalConsultations: 0,
    totalCitations: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {profile?.faculty && (
        <div className="card-elevated p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {profile.faculty.name?.[0] || '?'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.faculty.name}</h1>
              <p className="text-muted-foreground">{profile.faculty.designation} - {profile.faculty.department}</p>
              {profile.faculty.specialization && (
                <p className="text-sm text-primary mt-1">{profile.faculty.specialization}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold">{stats.totalPublications}</p>
                <p className="text-xs text-muted-foreground">Publications</p>
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalCitations}</p>
                <p className="text-xs text-muted-foreground">Citations</p>
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalAwards}</p>
                <p className="text-xs text-muted-foreground">Awards</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'publications', label: 'Publications', icon: BookOpen },
            { id: 'awards', label: 'Awards', icon: Trophy },
            { id: 'conferences', label: 'Conferences', icon: Mic2 },
            { id: 'consultations', label: 'Consultations', icon: Briefcase },
          ].map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="card-elevated p-5 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalPublications}</p>
              <p className="text-sm text-muted-foreground">Publications</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <Quote className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalCitations}</p>
              <p className="text-sm text-muted-foreground">Total Citations</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalAwards}</p>
              <p className="text-sm text-muted-foreground">Awards</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <Mic2 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalConferences}</p>
              <p className="text-sm text-muted-foreground">Conferences</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalConsultations}</p>
              <p className="text-sm text-muted-foreground">Consultations</p>
            </div>
          </div>

          {profile?.faculty?.bio && (
            <div className="card-elevated p-6 mt-4">
              <h3 className="text-lg font-semibold mb-3">Biography</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.faculty.bio}</p>
            </div>
          )}

          {profile?.faculty?.qualifications && (
            <div className="card-elevated p-6 mt-4">
              <h3 className="text-lg font-semibold mb-3">Qualifications</h3>
              <p className="text-muted-foreground">{profile.faculty.qualifications}</p>
            </div>
          )}
        </TabsContent>

        {/* Publications */}
        <TabsContent value="publications" className="mt-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Button onClick={openCreatePublication}>
                <Plus className="w-4 h-4 mr-2" /> Add Publication
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {profile?.publications.map((pub, idx) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5"
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
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pub.abstract}</p>
                    )}
                    {pub.coAuthors && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Co-authors: {pub.coAuthors}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pub.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={pub.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => openEditPublication(pub)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePublication(pub.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {(!profile?.publications || profile.publications.length === 0) && (
            <div className="card-elevated p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No publications yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Awards */}
        <TabsContent value="awards" className="mt-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Button onClick={openCreateAward}>
                <Plus className="w-4 h-4 mr-2" /> Add Award
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {profile?.awards.map((award, idx) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold">{award.title}</h3>
                      <Badge variant="outline" className="text-xs">{award.category}</Badge>
                    </div>
                    {award.description && (
                      <p className="text-sm text-muted-foreground mt-2">{award.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
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
                  {canEdit && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEditAward(award)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAward(award.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {(!profile?.awards || profile.awards.length === 0) && (
            <div className="card-elevated p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No awards yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Conferences */}
        <TabsContent value="conferences" className="mt-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Button onClick={openCreateConference}>
                <Plus className="w-4 h-4 mr-2" /> Add Conference
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {profile?.conferences.map((conf, idx) => (
              <motion.div
                key={conf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mic2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{conf.name}</h3>
                      {conf.role && (
                        <Badge variant="secondary" className="text-xs capitalize">{conf.role}</Badge>
                      )}
                    </div>
                    {conf.presentationTitle && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Presentation: {conf.presentationTitle}
                      </p>
                    )}
                    {conf.description && (
                      <p className="text-sm text-muted-foreground mt-1">{conf.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {conf.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {conf.location}
                        </span>
                      )}
                      {conf.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(conf.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEditConference(conf)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteConference(conf.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {(!profile?.conferences || profile.conferences.length === 0) && (
            <div className="card-elevated p-12 text-center">
              <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No conferences yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Consultations */}
        <TabsContent value="consultations" className="mt-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Button onClick={openCreateConsultation}>
                <Plus className="w-4 h-4 mr-2" /> Add Consultation
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {profile?.consultations.map((consult, idx) => (
              <motion.div
                key={consult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{consult.organization}</h3>
                      <Badge
                        variant={consult.status === 'active' ? 'default' : consult.status === 'ongoing' ? 'secondary' : 'outline'}
                        className="text-xs capitalize"
                      >
                        {consult.status}
                      </Badge>
                    </div>
                    {consult.description && (
                      <p className="text-sm text-muted-foreground mt-2">{consult.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {consult.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> From {new Date(consult.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {consult.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> To {new Date(consult.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEditConsultation(consult)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteConsultation(consult.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {(!profile?.consultations || profile.consultations.length === 0) && (
            <div className="card-elevated p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No consultations yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Publication Dialog */}
      <Dialog open={showPublicationDialog} onOpenChange={setShowPublicationDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPublication ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input value={publicationForm.title} onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Journal</label>
                <Input value={publicationForm.journal} onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Conference</label>
                <Input value={publicationForm.conference} onChange={(e) => setPublicationForm({ ...publicationForm, conference: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input type="number" value={publicationForm.year} onChange={(e) => setPublicationForm({ ...publicationForm, year: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Citations</label>
                <Input type="number" value={publicationForm.citations} onChange={(e) => setPublicationForm({ ...publicationForm, citations: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">DOI</label>
              <Input value={publicationForm.doi} onChange={(e) => setPublicationForm({ ...publicationForm, doi: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input value={publicationForm.url} onChange={(e) => setPublicationForm({ ...publicationForm, url: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Abstract</label>
              <Textarea value={publicationForm.abstract} onChange={(e) => setPublicationForm({ ...publicationForm, abstract: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Co-Authors (comma-separated)</label>
              <Input value={publicationForm.coAuthors} onChange={(e) => setPublicationForm({ ...publicationForm, coAuthors: e.target.value })} className="mt-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPublicationDialog(false)}>Cancel</Button>
              <Button onClick={handleSavePublication} disabled={savingPublication}>
                {savingPublication ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingPublication ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Award Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAward ? 'Edit Award' : 'Add Award'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input value={awardForm.title} onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Awarded By</label>
              <Input value={awardForm.awardedBy} onChange={(e) => setAwardForm({ ...awardForm, awardedBy: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input type="number" value={awardForm.year} onChange={(e) => setAwardForm({ ...awardForm, year: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={awardForm.category} onValueChange={(v) => setAwardForm({ ...awardForm, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={awardForm.description} onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveAward} disabled={savingAward}>
                {savingAward ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingAward ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conference Dialog */}
      <Dialog open={showConferenceDialog} onOpenChange={setShowConferenceDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConference ? 'Edit Conference' : 'Add Conference'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Conference Name *</label>
              <Input value={conferenceForm.name} onChange={(e) => setConferenceForm({ ...conferenceForm, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input value={conferenceForm.location} onChange={(e) => setConferenceForm({ ...conferenceForm, location: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={conferenceForm.startDate} onChange={(e) => setConferenceForm({ ...conferenceForm, startDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={conferenceForm.endDate} onChange={(e) => setConferenceForm({ ...conferenceForm, endDate: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={conferenceForm.role} onValueChange={(v) => setConferenceForm({ ...conferenceForm, role: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presenter">Presenter</SelectItem>
                  <SelectItem value="keynote">Keynote Speaker</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="attendee">Attendee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Presentation Title</label>
              <Input value={conferenceForm.presentationTitle} onChange={(e) => setConferenceForm({ ...conferenceForm, presentationTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={conferenceForm.description} onChange={(e) => setConferenceForm({ ...conferenceForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConferenceDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveConference} disabled={savingConference}>
                {savingConference ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingConference ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Dialog */}
      <Dialog open={showConsultationDialog} onOpenChange={setShowConsultationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConsultation ? 'Edit Consultation' : 'Add Consultation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organization *</label>
              <Input value={consultationForm.organization} onChange={(e) => setConsultationForm({ ...consultationForm, organization: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={consultationForm.description} onChange={(e) => setConsultationForm({ ...consultationForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={consultationForm.startDate} onChange={(e) => setConsultationForm({ ...consultationForm, startDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={consultationForm.endDate} onChange={(e) => setConsultationForm({ ...consultationForm, endDate: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={consultationForm.status} onValueChange={(v) => setConsultationForm({ ...consultationForm, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConsultationDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveConsultation} disabled={savingConsultation}>
                {savingConsultation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingConsultation ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
