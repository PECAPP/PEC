import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface Education {
  institution: string;
  degree: string;
  major: string;
  year: string;
  gpa: string;
  honors: string;
  coursework: string[];
}

interface Experience {
  company: string;
  title: string;
  duration: string;
  location: string;
  description: string[];
}

interface Project {
  name: string;
  date: string;
  description: string[];
}

interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: {
    technical: string;
    programming: string;
    languages: string;
    certifications: string;
  };
}

export default function ResumeBuilderIvyLeague() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: 'FIRST LAST',
      location: 'Los Angeles, CA',
      email: 'email@example.com',
      phone: '(123) 456-7891',
      linkedin: 'linkedin.com/in/username',
    },
    education: [
      {
        institution: 'IVY LEAGUE UNIVERSITY',
        degree: 'Bachelor of Engineering',
        major: 'Major in Computer Science; Minors in Mathematics',
        year: 'Expected May 2026',
        gpa: '3.8/4.0',
        honors: 'Dean\'s List 2020-2025',
        coursework: ['Software Engineering', 'Operating Systems', 'Algorithms'],
      },
    ],
    experience: [
      {
        company: 'SOME ENGINEERING COMPANY',
        title: 'Mechanical Engineering Intern',
        duration: 'Jun 2025 - Sep 2025',
        location: 'City, ST',
        description: [
          'Coordinated hydraulic testing of pumps to verify performance parameters',
          'Analyzed $10M of motion data from distributed sensors',
        ],
      },
    ],
    projects: [
      {
        name: 'PROJECT NAME',
        date: 'Month Year',
        description: [
          'Designed a 3D model using SolidWorks',
          'Performed Finite Element Analysis (FEA) on project',
        ],
      },
    ],
    skills: {
      technical: 'Advanced in CAD (SolidWorks, AutoCAD)',
      programming: 'Proficient in MATLAB, Python',
      languages: 'Fluent in English, French; Conversational Proficiency in Japanese',
      certifications: 'SolidWorks, AutoCAD; Dean\'s List (2020, 2025)',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profileDoc = await getDoc(doc(db, 'studentProfiles', user.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data();
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              name: user.fullName || prev.personalInfo.name,
              email: user.email || prev.personalInfo.email,
              phone: profile.phone || prev.personalInfo.phone,
              location: `${profile.city || ''}, ${profile.state || ''}`.trim() || prev.personalInfo.location,
              linkedin: profile.linkedin || prev.personalInfo.linkedin,
            },
            education: [{
              institution: 'POORNIMA UNIVERSITY',
              degree: profile.degree || 'Bachelor of Technology',
              major: profile.department || 'Computer Science Engineering',
              year: `Expected ${profile.batch?.split('-')[1] || '2026'}`,
              gpa: profile.cgpa || 'N/A',
              honors: '',
              coursework: [],
            }]
          }));
          toast.success('Resume data auto-filled from your profile');
        }
      } catch (error) {
        console.error("Error fetching profile for resume:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const [preview, setPreview] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      (newEducation[index] as any)[field] = value;
      return { ...prev, education: newEducation };
    });
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      (newExperience[index] as any)[field] = value;
      return { ...prev, experience: newExperience };
    });
  };

  const handleProjectChange = (index: number, field: string, value: any) => {
    setResumeData(prev => {
      const newProjects = [...prev.projects];
      (newProjects[index] as any)[field] = value;
      return { ...prev, projects: newProjects };
    });
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        title: '',
        duration: '',
        location: '',
        description: [''],
      }],
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        date: '',
        description: [''],
      }],
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const downloadPDF = () => {
    // TODO: Implement PDF generation using a library like jsPDF or html2pdf
    alert('PDF download functionality will be implemented with jsPDF/html2pdf');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold">Ivy League Resume Builder</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {preview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={downloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground font-medium italic">Fetching your profile data...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          {!preview && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:flex lg:flex-nowrap overflow-x-auto overflow-y-hidden tabs-list-scroll">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>

                {/* Personal Info */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="bg-card rounded-lg p-6 space-y-4 border border-border">
                    <h3 className="font-bold text-lg">Personal Information</h3>
                    
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        value={resumeData.personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                        placeholder="FIRST LAST"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          type="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                          placeholder="(123) 456-7891"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">LinkedIn</label>
                        <Input
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Education */}
                <TabsContent value="education" className="space-y-4">
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="bg-card rounded-lg p-6 border border-border space-y-4">
                      <div>
                        <label className="text-sm font-medium">University</label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                          placeholder="University Name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Degree</label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Expected Year</label>
                          <Input
                            value={edu.year}
                            onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                            placeholder="May 2026"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Major/Minor</label>
                        <Input
                          value={edu.major}
                          onChange={(e) => handleEducationChange(idx, 'major', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">GPA</label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Honors</label>
                          <Input
                            value={edu.honors}
                            onChange={(e) => handleEducationChange(idx, 'honors', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Relevant Coursework</label>
                        <Textarea
                          value={edu.coursework.join('; ')}
                          onChange={(e) => handleEducationChange(idx, 'coursework', e.target.value.split('; '))}
                          placeholder="Separate with semicolons"
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Experience */}
                <TabsContent value="experience" className="space-y-4">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-card rounded-lg p-6 border border-border space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium">Company</label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            placeholder="Company Name"
                          />
                        </div>
                        {resumeData.experience.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(idx)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Job Title</label>
                          <Input
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Duration</label>
                          <Input
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                            placeholder="Jun 2025 - Sep 2025"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={exp.location}
                          onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                          placeholder="City, ST"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description (one per line)</label>
                        <Textarea
                          value={exp.description.join('\n')}
                          onChange={(e) => handleExperienceChange(idx, 'description', e.target.value.split('\n'))}
                          placeholder="Bullet point descriptions"
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                  <Button onClick={addExperience} variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </TabsContent>

                {/* Projects */}
                <TabsContent value="projects" className="space-y-4">
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="bg-card rounded-lg p-6 border border-border space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label className="text-sm font-medium">Project Name</label>
                          <Input
                            value={proj.name}
                            onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                            placeholder="Project Title"
                          />
                        </div>
                        {resumeData.projects.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(idx)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          value={proj.date}
                          onChange={(e) => handleProjectChange(idx, 'date', e.target.value)}
                          placeholder="Feb 2025"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description (one per line)</label>
                        <Textarea
                          value={proj.description.join('\n')}
                          onChange={(e) => handleProjectChange(idx, 'description', e.target.value.split('\n'))}
                          placeholder="Bullet point descriptions"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  <Button onClick={addProject} variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Project
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${preview ? 'lg:col-span-2' : ''}`}
          >
            <div className="bg-white text-black rounded-lg p-8 shadow-xl border border-gray-200 font-serif text-sm leading-relaxed">
              {/* Header */}
              <div className="text-center mb-4 border-b-2 border-black pb-3">
                <h1 className="text-base font-bold tracking-wide">{resumeData.personalInfo.name}</h1>
                <p className="text-xs">
                  {resumeData.personalInfo.location} | {resumeData.personalInfo.phone} | {resumeData.personalInfo.email} | {resumeData.personalInfo.linkedin}
                </p>
              </div>

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold tracking-wider border-b border-black mb-2">EDUCATION</h2>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-xs">{edu.institution}</span>
                        <span className="text-xs">{edu.year}</span>
                      </div>
                      <div className="text-xs italic">{edu.degree}</div>
                      <div className="text-xs">{edu.major}</div>
                      {edu.gpa && <div className="text-xs">Cumulative GPA: {edu.gpa}</div>}
                      {edu.honors && <div className="text-xs">{edu.honors}</div>}
                      {edu.coursework.length > 0 && (
                        <div className="text-xs">Relevant Coursework: {edu.coursework.join('; ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold tracking-wider border-b border-black mb-2">WORK EXPERIENCE</h2>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-xs">{exp.company}</span>
                        <span className="text-xs">{exp.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs italic">{exp.title}</span>
                        <span className="text-xs">{exp.duration}</span>
                      </div>
                      <ul className="text-xs list-disc ml-5 mt-1">
                        {exp.description.filter(d => d.trim()).map((desc, i) => (
                          <li key={i} className="text-xs">{desc.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold tracking-wider border-b border-black mb-2">UNIVERSITY PROJECTS</h2>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-xs">{proj.name.toUpperCase()}</span>
                        <span className="text-xs">{proj.date}</span>
                      </div>
                      <ul className="text-xs list-disc ml-5 mt-1">
                        {proj.description.filter(d => d.trim()).map((desc, i) => (
                          <li key={i} className="text-xs">{desc.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div>
                <h2 className="text-xs font-bold tracking-wider border-b border-black mb-2">ADDITIONAL</h2>
                {resumeData.skills.technical && (
                  <div className="text-xs mb-1">
                    <span className="font-bold">Technical Skills:</span> {resumeData.skills.technical}
                  </div>
                )}
                {resumeData.skills.programming && (
                  <div className="text-xs mb-1">
                    <span className="font-bold">Programming Skills:</span> {resumeData.skills.programming}
                  </div>
                )}
                {resumeData.skills.languages && (
                  <div className="text-xs mb-1">
                    <span className="font-bold">Languages:</span> {resumeData.skills.languages}
                  </div>
                )}
                {resumeData.skills.certifications && (
                  <div className="text-xs">
                    <span className="font-bold">Certifications & Awards:</span> {resumeData.skills.certifications}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}
