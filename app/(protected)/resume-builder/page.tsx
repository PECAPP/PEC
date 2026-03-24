'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  LogOut,
  Save,
  Loader2,
  Upload,
  Sparkles,
  ArrowRight,
  Target,
  Lightbulb,
  RefreshCw,
  Github,
  Linkedin,
  Building2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { useCollegeSettings } from "@/hooks/useCollegeSettings";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingGrid, StatePanel } from "@/components/common/AsyncState";
import { doc, getDoc } from "@/lib/postgres-bridge";

// Interfaces (Strictly conserved)
interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
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

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
}

const ResumeAnalyzerPanel = dynamic(
  () => import("./components/ResumeAnalyzerPanel").then((mod) => mod.ResumeAnalyzerPanel),
  {
    ssr: false,
    loading: () => (
      <div className="card-elevated ui-card-pad min-h-[320px] animate-pulse" />
    ),
  },
);
let pdfJsPromise: Promise<any> | null = null;

const callOpenAI = async (payload: unknown) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('AI proxy request failed');
  }

  return response.json();
};

const getPdfJs = async () => {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Use CDN worker to avoid bundler-specific `?url` typing/import issues.
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      return pdfjs;
    });
  }
  return pdfJsPromise;
};

export default function ResumeBuilderIvyLeague() {
  const { user } = useAuth();
  const { settings } = useCollegeSettings();
  const [loading, setLoading] = useState(true);
  // Add this with your other state declarations
  const [selectedResume, setSelectedResume] = useState<"current" | "upload">(
    "current",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  // Layout Controls
  const [zoom, setZoom] = useState(0.85); // Default scaled down to fit better

  // Builder State
  const [preview, setPreview] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "ARJUN PATEL",
      location: "Kanpur, Uttar Pradesh",
      email: "arjun.patel@pec.edu",
      phone: "+91 7700454732",
      linkedin: "linkedin.com/in/arjunpatel",
      github: "github.com/arjuncode",
    },
    // Dummy Data Pre-filled
    education: [
      {
        institution: "PUNJAB ENGINEERING COLLEGE",
        degree: "Bachelor of Technology",
        major: "Computer Science & Engineering",
        year: "Expected 2026",
        gpa: "8.4/10.0",
        honors: "",
        coursework: ["Data Structures", "Algorithms", "DBMS", "OS"],
      },
    ],
    experience: [
      {
        company: "TECH INNOVATIONS INC.",
        title: "Software Engineering Intern",
        duration: "Jun 2024 - Aug 2024",
        location: "Bangalore, India",
        description: [
          "Developed RESTful APIs using Node.js and Express to handle 10k+ daily requests.",
          "Optimized MongoDB queries reducing response time by 40%.",
          "Collaborated with frontend team to integrate React components.",
        ],
      },
    ],
    projects: [
      {
        name: "SMART CAMPUS APP",
        date: "Jan 2024",
        description: [
          "Built a Flutter based mobile application for campus navigation and attendance.",
          "Integrated PostgreSQL-backed APIs for real-time notifications and data sync.",
          "Deployed to Play Store with over 500+ active student users.",
        ],
      },
    ],
    skills: {
      technical: "Unreal Engine 5, Blender, React.js, Node.js",
      programming: "C++, Python, JavaScript, TypeScript, Dart",
      languages: "English (Fluent), Hindi (Native)",
      certifications: "AWS Cloud Practitioner, Meta Frontend Developer",
    },
  });

  // Analyzer State
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );

  useEffect(() => {
    const fetchProfile = async () => {
      // Logic: Only overwrite fields if they are defaults, or if user data exists.
      // Current dummy data is useful placeholders. We will overwrite personal info with real user info if available.
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(({} as any), "studentProfiles", user.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data();

          setResumeData((prev) => ({
            ...prev,
            personalInfo: {
              name: user.fullName || prev.personalInfo.name,
              email: user.email || prev.personalInfo.email,
              phone: profile.phone || prev.personalInfo.phone,
              location:
                [profile.city, profile.state].filter(Boolean).join(", ") ||
                prev.personalInfo.location,
              linkedin: profile.linkedinUsername
                ? `linkedin.com/in/${profile.linkedinUsername}`
                : prev.personalInfo.linkedin,
              github: profile.githubUsername
                ? `github.com/${profile.githubUsername}`
                : prev.personalInfo.github,
            },
            education: [
              {
                institution:
                  settings?.collegeName || prev.education[0].institution,
                degree: profile.degree || prev.education[0].degree,
                major: profile.department || prev.education[0].major,
                year: profile.batch
                  ? `Expected ${profile.batch.split("-")[1]}`
                  : prev.education[0].year,
                gpa: profile.cgpa
                  ? `${profile.cgpa}/10.0`
                  : prev.education[0].gpa,
                honors: "",
                coursework: prev.education[0].coursework, // Keep dummy
              },
            ],
          }));

          // Note: We deliberately KEEP the dummy Experience/Projects if the user's profile doesn't have them
          // In a real app we might fetch these from 'experiences' collection if it existed.
          toast.success("Synced with your profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, settings]);

  // --- Builder Handlers ---
  const handlePersonalInfoChange = (
    field: keyof PersonalInfo,
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    // Load the document using the local worker
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false, // Prevents additional external fetches
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error("Could not read PDF text. Please ensure it's not a scanned image.");
  }
};
  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const handleEducationChange = (index: number, field: string, value: any) => {
    setResumeData((prev) => {
      const newEdu = [...prev.education];
      (newEdu[index] as any)[field] = value;
      return { ...prev, education: newEdu };
    });
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "Company Name",
          title: "Job Title",
          duration: "Date Range",
          location: "Location",
          description: ["Description bullet point"],
        },
      ],
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "Project Name",
          date: "Date",
          description: ["Project description"],
        },
      ],
    }));
  };

  const removeExperience = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  const removeProject = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));

  const handleExperienceChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.experience];
      (arr[i] as any)[f] = v;
      return { ...prev, experience: arr };
    });
  };

  const handleProjectChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.projects];
      (arr[i] as any)[f] = v;
      return { ...prev, projects: arr };
    });
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let yPos = 20;

    // Logo Logic (Try to fetch if URL exists)
    // For simplicity in client-side only without proxy, we might skip actual image or use a placeholder
    // If settings?.logoUrl is base64 it works instantly. If https, it might fail CORS.

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(resumeData.personalInfo.name.toUpperCase(), 105, yPos, {
      align: "center",
    });
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const contactParts = [
      resumeData.personalInfo.location,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.email,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github,
    ];

    doc.text(contactParts.filter(Boolean).join(" | "), 105, yPos, {
      align: "center",
    });
    yPos += 10;

    const addSection = (title: string) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 14, yPos);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 7;
    };

    // Education
    if (resumeData.education.length > 0) {
      addSection("Education");
      resumeData.education.forEach((edu) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(edu.institution, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(edu.year, 196, yPos, { align: "right" });
        yPos += 5;

        doc.setFont("helvetica", "italic");
        doc.text(`${edu.degree} in ${edu.major}`, 14, yPos);
        if (edu.gpa) doc.text(`GPA: ${edu.gpa}`, 196, yPos, { align: "right" });
        yPos += 5;

        if (edu.coursework.length > 0 && edu.coursework[0]) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const text = `Relevant Coursework: ${edu.coursework.join(", ")}`;
          const split = doc.splitTextToSize(text, 180);
          doc.text(split, 14, yPos);
          yPos += split.length * 4;
        }
        yPos += 3;
      });
    }

    // Experience
    if (resumeData.experience.length > 0) {
      addSection("Work Experience");
      resumeData.experience.forEach((exp) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(exp.company, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(exp.location, 196, yPos, { align: "right" });
        yPos += 5;

        doc.setFont("helvetica", "italic");
        doc.text(exp.title, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(exp.duration, 196, yPos, { align: "right" });
        yPos += 5;

        exp.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const bullet = `• ${d}`;
          const split = doc.splitTextToSize(bullet, 180);
          doc.text(split, 18, yPos);
          yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

    // Projects
    if (resumeData.projects.length > 0) {
      addSection("Projects");
      resumeData.projects.forEach((proj) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(proj.name, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(proj.date, 196, yPos, { align: "right" });
        yPos += 5;

        proj.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const bullet = `• ${d}`;
          const split = doc.splitTextToSize(bullet, 180);
          doc.text(split, 18, yPos);
          yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

    // Skills
    addSection("Skills");
    const skills = [
      { l: "Technical", v: resumeData.skills.technical },
      { l: "Programming", v: resumeData.skills.programming },
      { l: "Languages", v: resumeData.skills.languages },
      { l: "Certifications", v: resumeData.skills.certifications },
    ];
    doc.setFontSize(9);
    skills.forEach((s) => {
      if (s.v) {
        doc.setFont("helvetica", "bold");
        doc.text(`${s.l}:`, 14, yPos);
        doc.setFont("helvetica", "normal");
        const split = doc.splitTextToSize(s.v, 150);
        doc.text(split, 45, yPos);
        yPos += split.length * 4 + 2;
      }
    });

    doc.save(`${resumeData.personalInfo.name}_Resume.pdf`);
  };

  // --- Analyzer Handlers ---
const handleAnalyze = async (customFile?: File) => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let resumeContext = "";
      const targetFile = customFile || (selectedResume === "upload" ? uploadedFile : null);

      if (targetFile) {
        // CASE 1: External PDF Upload - Extract text locally
        if (targetFile.type === "application/pdf") {
          resumeContext = await extractTextFromPDF(targetFile);
        } else {
          // Fallback for images if you still want to allow them
          const base64 = await fileToBase64(targetFile);
          resumeContext = `[IMAGE_CONTENT_BASE64:${base64}]`; 
        }
      } else {
        // CASE 2: Builder Data - Use structured JSON
        resumeContext = JSON.stringify(resumeData, null, 2);
      }

      const response = await callOpenAI({
        model: "gpt-4o-mini", // Optimized for high-speed text analysis
        messages: [
          {
            role: "system",
            content: "You are an expert ATS (Applicant Tracking System). Analyze the resume text against the Job Description and return strictly JSON."
          },
          {
            role: "user",
            content: `
            Analyze this resume against the job description below.
            
            JOB DESCRIPTION:
            "${jobDescription}"

            RESUME DATA/TEXT:
            "${resumeContext}"

            Return a JSON object exactly in this format:
            {
              "matchScore": number,
              "strengths": string[],
              "gaps": string[],
              "suggestions": string[],
              "keywordMatch": [{"keyword": string, "found": boolean}]
            }`
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (content) {
        setAnalysisResult(JSON.parse(content) as AnalysisResult);
        toast.success("AI Analysis Complete!");
      }
    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error("Analysis failed. Please check your network or PDF format.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-32 rounded-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-card/95 border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Resume Hub</h1>
                <p className="text-xs text-muted-foreground">
                  {settings?.collegeName || "Career Center"}
                </p>
              </div>
            </div>

            <div className="flex bg-secondary/70 p-1 rounded-md border border-border">
              <button
                onClick={() => setActiveTab("builder")}
                className={cn(
                  "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                  activeTab === "builder"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                )}
              >
                Builder
              </button>
              <button
                onClick={() => setActiveTab("analyzer")}
                className={cn(
                  "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                  activeTab === "analyzer"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                )}
              >
                AI Analyzer
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "builder" && (
                <>
                  <div className="flex items-center gap-1 mr-2 bg-secondary rounded-md p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    >
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <span className="text-xs w-9 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                    >
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {preview ? "Edit" : "Preview"}
                  </Button>
                  <Button size="sm" className="h-9" onClick={downloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* BUILDER TAB */}
        {activeTab === "builder" && (
          <div className="grid xl:grid-cols-12 gap-6 items-start">
            {/* Editor - Scrollable */}
            {!preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="xl:col-span-6 space-y-6"
              >
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="w-full justify-start overflow-auto no-scrollbar bg-muted/40 border border-border p-1">
                    <TabsTrigger value="personal" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Personal</TabsTrigger>
                    <TabsTrigger value="education" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Education</TabsTrigger>
                    <TabsTrigger value="experience" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Experience</TabsTrigger>
                    <TabsTrigger value="projects" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Projects</TabsTrigger>
                    <TabsTrigger value="skills" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Skills</TabsTrigger>
                  </TabsList>

                  {/* Content Panels (Same as before, preserved logic) */}
                  <TabsContent
                    value="personal"
                    className="card-elevated ui-card-pad space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={resumeData.personalInfo.name}
                          onChange={(e) =>
                            handlePersonalInfoChange("name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) =>
                            handlePersonalInfoChange("location", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={resumeData.personalInfo.email}
                          onChange={(e) =>
                            handlePersonalInfoChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) =>
                            handlePersonalInfoChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">LinkedIn</label>
                        <Input
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) =>
                            handlePersonalInfoChange("linkedin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">GitHub</label>
                        <Input
                          value={resumeData.personalInfo.github}
                          onChange={(e) =>
                            handlePersonalInfoChange("github", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-4">
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="card-elevated ui-card-pad space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Institution
                          </label>
                          <Input
                            value={edu.institution}
                            onChange={(e) =>
                              handleEducationChange(
                                idx,
                                "institution",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Degree
                            </label>
                            <Input
                              value={edu.degree}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "degree",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Year</label>
                            <Input
                              value={edu.year}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "year",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Major</label>
                            <Input
                              value={edu.major}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "major",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">GPA</label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "gpa",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Relevant Coursework
                          </label>
                          <Textarea
                            value={edu.coursework.join(", ")}
                            onChange={(e) =>
                              handleEducationChange(
                                idx,
                                "coursework",
                                e.target.value.split(", "),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4 mt-4">
                    {resumeData.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="card-elevated ui-card-pad space-y-4 relative"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => removeExperience(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "company",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Title"
                            value={exp.title}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "title",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Date Range"
                            value={exp.duration}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "duration",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Location"
                            value={exp.location}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "location",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={exp.description.join("\n")}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "description",
                              e.target.value.split("\n"),
                            )
                          }
                        />
                      </div>
                    ))}
                    <Button
                      onClick={addExperience}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4 mt-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="card-elevated ui-card-pad space-y-4 relative"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => removeProject(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Project Name"
                            value={proj.name}
                            onChange={(e) =>
                              handleProjectChange(idx, "name", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Date"
                            value={proj.date}
                            onChange={(e) =>
                              handleProjectChange(idx, "date", e.target.value)
                            }
                          />
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={proj.description.join("\n")}
                          onChange={(e) =>
                            handleProjectChange(
                              idx,
                              "description",
                              e.target.value.split("\n"),
                            )
                          }
                        />
                      </div>
                    ))}
                    <Button
                      onClick={addProject}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                  </TabsContent>

                  <TabsContent
                    value="skills"
                    className="card-elevated ui-card-pad space-y-4 mt-4"
                  >
                    <div>
                      <label className="text-sm font-medium">
                        Technical Skills
                      </label>
                      <Input
                        value={resumeData.skills.technical}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: { ...p.skills, technical: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Programming</label>
                      <Input
                        value={resumeData.skills.programming}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: {
                              ...p.skills,
                              programming: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Languages</label>
                      <Input
                        value={resumeData.skills.languages}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: { ...p.skills, languages: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Certifications
                      </label>
                      <Input
                        value={resumeData.skills.certifications}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: {
                              ...p.skills,
                              certifications: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {/* Preview - Sticky & Scaled */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "xl:col-span-6",
                preview
                  ? "xl:col-span-12 relative mx-auto max-w-4xl"
                  : "",
              )}
            >
              <div
                className="bg-white text-black shadow-xl border border-border origin-top-left transition-transform duration-150"
                style={{
                  width: "8.5in",
                  minHeight: "11in",
                  transform: preview ? "none" : `scale(${zoom})`,
                  transformOrigin: preview ? "top center" : "top left",
                  margin: preview ? "0 auto" : "0",
                }}
              >
                <div className="p-[0.4in]">
                  {/* Resume Header */}
                  <div className="text-center border-b-2 border-black pb-4 mb-4">
                    <h1 className="text-3xl font-bold text-black tracking-widest mb-3">
                      {resumeData.personalInfo.name.toUpperCase()}
                    </h1>
                    <div className="text-xs flex flex-wrap justify-center gap-x-2 text-gray-800">
                      {resumeData.personalInfo.location && (
                        <span>{resumeData.personalInfo.location}</span>
                      )}
                      {resumeData.personalInfo.phone && (
                        <span>• {resumeData.personalInfo.phone}</span>
                      )}
                      {resumeData.personalInfo.email && (
                        <span className="text-blue-900">
                          • {resumeData.personalInfo.email}
                        </span>
                      )}
                    </div>
                    <div className="text-xs flex flex-wrap justify-center gap-x-3 mt-1 text-blue-800 font-medium">
                      {resumeData.personalInfo.linkedin && (
                        <span>{resumeData.personalInfo.linkedin}</span>
                      )}
                      {resumeData.personalInfo.github && (
                        <span>{resumeData.personalInfo.github}</span>
                      )}
                    </div>
                  </div>

                  {/* Resume Body */}
                  <div className="space-y-5">
                    {/* Education */}
                    <section>
                      <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                        Education
                      </h2>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="mb-3">
                          <div className="flex justify-between font-bold text-sm">
                            <span>{edu.institution.toUpperCase()}</span>
                            <span>{edu.year}</span>
                          </div>
                          <div className="flex justify-between text-xs italic">
                            <span>
                              {edu.degree} in {edu.major}
                            </span>
                            <span className="font-semibold">
                              {edu.gpa ? `GPA: ${edu.gpa}` : ""}
                            </span>
                          </div>
                          {edu.coursework.length > 0 && (
                            <div className="text-xs mt-1.5 leading-relaxed">
                              <span className="font-semibold">
                                Relevant Coursework:
                              </span>{" "}
                              {edu.coursework.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </section>

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <section>
                        <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                          Work Experience
                        </h2>
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="mb-4">
                            <div className="flex justify-between font-bold text-sm">
                              <span>{exp.company.toUpperCase()}</span>
                              <span>{exp.location}</span>
                            </div>
                            <div className="flex justify-between text-xs italic mb-1.5">
                              <span>{exp.title}</span>
                              <span>{exp.duration}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-xs space-y-1 leading-normal">
                              {exp.description.filter(Boolean).map((d, j) => (
                                <li key={j}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <section>
                        <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                          Projects
                        </h2>
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="mb-4">
                            <div className="flex justify-between font-bold text-sm">
                              <span>{proj.name.toUpperCase()}</span>
                              <span>{proj.date}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-xs space-y-1 mt-1 leading-normal">
                              {proj.description.filter(Boolean).map((d, j) => (
                                <li key={j}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Skills */}
                    <section>
                      <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                        Skills & Interests
                      </h2>
                      <div className="text-xs space-y-1.5 leading-normal">
                        {resumeData.skills.technical && (
                          <div>
                            <span className="font-bold">Technical:</span>{" "}
                            {resumeData.skills.technical}
                          </div>
                        )}
                        {resumeData.skills.programming && (
                          <div>
                            <span className="font-bold">Programming:</span>{" "}
                            {resumeData.skills.programming}
                          </div>
                        )}
                        {resumeData.skills.languages && (
                          <div>
                            <span className="font-bold">Languages:</span>{" "}
                            {resumeData.skills.languages}
                          </div>
                        )}
                        {resumeData.skills.certifications && (
                          <div>
                            <span className="font-bold">Certifications:</span>{" "}
                            {resumeData.skills.certifications}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              {/* Preview Footer Helper */}
              {!preview && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Preview scaled by {Math.round(zoom * 100)}%. Download PDF for
                  actual A4 size.
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* ANALYZER TAB */}
        {activeTab === 'analyzer' && (
          <ResumeAnalyzerPanel
            selectedResume={selectedResume}
            setSelectedResume={setSelectedResume}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            isAnalyzing={isAnalyzing}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            analysisResult={analysisResult}
            onAnalyze={() => handleAnalyze()}
          />
        )}
      </div>
    </div>
  );
}
