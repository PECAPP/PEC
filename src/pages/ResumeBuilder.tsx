import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Edit3,
  Save,
  QrCode,
  Eye,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  achievements: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

const initialResumeData: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    summary: 'Passionate Computer Science student with strong foundation in data structures, algorithms, and machine learning. Experienced in building scalable web applications and contributing to open-source projects.',
  },
  education: [
    {
      degree: 'B.Tech in Computer Science',
      institution: 'Indian Institute of Technology',
      year: '2021 - 2025',
      cgpa: '8.78',
    },
    {
      degree: 'Higher Secondary (PCM)',
      institution: 'Delhi Public School',
      year: '2019 - 2021',
      cgpa: '95.2%',
    },
  ],
  experience: [
    {
      title: 'Software Engineering Intern',
      company: 'Google',
      duration: 'May 2024 - Aug 2024',
      description: 'Developed ML pipeline for content recommendation. Improved model accuracy by 15%.',
    },
    {
      title: 'Open Source Contributor',
      company: 'TensorFlow',
      duration: 'Jan 2024 - Present',
      description: 'Contributed to documentation and fixed bugs in the core library.',
    },
  ],
  skills: ['Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'AWS', 'Docker', 'PostgreSQL', 'Git', 'Machine Learning'],
  achievements: [
    'Google Summer of Code 2024 participant',
    'ACM ICPC Regional Finalist 2023',
    'Published research paper on NLP at IEEE conference',
    'Dean\'s List for academic excellence (4 semesters)',
  ],
  projects: [
    {
      name: 'AI-Powered Study Assistant',
      description: 'Built a chatbot using GPT-4 API for personalized learning',
      technologies: ['Python', 'FastAPI', 'React', 'OpenAI'],
    },
    {
      name: 'Real-time Collaboration Platform',
      description: 'WebSocket-based document editing with version control',
      technologies: ['Node.js', 'Socket.io', 'MongoDB', 'Redis'],
    },
  ],
};

export default function ResumeBuilder() {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [activeTab, setActiveTab] = useState('preview');

  const verificationUrl = 'https://uniflow.edu/verify/STU2021001';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Create and download your verified resume</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Resume
              </>
            )}
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Sections
          </TabsTrigger>
          <TabsTrigger value="verification">
            <QrCode className="w-4 h-4 mr-2" />
            Verification
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-8 max-w-4xl mx-auto bg-background"
          >
            {/* Resume Header */}
            <div className="border-b border-border pb-6 mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {resumeData.personalInfo.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {resumeData.personalInfo.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {resumeData.personalInfo.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {resumeData.personalInfo.location}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
              <p className="mt-4 text-muted-foreground">{resumeData.personalInfo.summary}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                {/* Experience */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary/30 pl-4">
                        <h4 className="font-medium text-foreground">{exp.title}</h4>
                        <p className="text-sm text-primary">{exp.company}</p>
                        <p className="text-xs text-muted-foreground mb-1">{exp.duration}</p>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <Code className="w-5 h-5 text-primary" />
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {resumeData.projects.map((project, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-foreground">{project.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                {/* Education */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {resumeData.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-foreground text-sm">{edu.degree}</h4>
                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.year} • CGPA: {edu.cgpa}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <Code className="w-5 h-5 text-primary" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Achievements */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </h3>
                  <ul className="space-y-2">
                    {resumeData.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* QR Code */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-16 h-16 bg-foreground rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-background" />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-foreground">Scan to Verify</p>
                      <p className="text-muted-foreground">ERP Verified Resume</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="mt-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Personal Info */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    value={resumeData.personalInfo.name}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, name: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    value={resumeData.personalInfo.email}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    value={resumeData.personalInfo.phone}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input
                    value={resumeData.personalInfo.location}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Summary</label>
                  <Textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, summary: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {resumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      onClick={() =>
                        setResumeData({
                          ...resumeData,
                          skills: resumeData.skills.filter((_, i) => i !== index),
                        })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a skill..." id="new-skill" />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('new-skill') as HTMLInputElement;
                    if (input.value) {
                      setResumeData({
                        ...resumeData,
                        skills: [...resumeData.skills, input.value],
                      });
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-8 text-center"
            >
              <div className="w-48 h-48 mx-auto bg-foreground rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-40 h-40 text-background" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Resume Verification</h3>
              <p className="text-muted-foreground mb-6">
                This QR code is embedded in your resume PDF. When scanned, recruiters can verify your credentials.
              </p>
              <div className="p-4 rounded-lg bg-muted/30 border border-border mb-6">
                <p className="text-sm font-medium text-foreground mb-1">Verification URL</p>
                <code className="text-xs text-primary break-all">{verificationUrl}</code>
              </div>
              <div className="text-left p-4 rounded-lg bg-success/10 border border-success/20">
                <h4 className="font-medium text-success mb-2">What recruiters will see:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Verified CGPA: 8.78</li>
                  <li>✓ Courses & academic achievements</li>
                  <li>✓ ERP-verified identity status</li>
                  <li>✓ Attendance record summary</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
