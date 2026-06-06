'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCollegeSettings } from "@/hooks/useCollegeSettings";
import api from "@/lib/api";
import { doc, getDoc, updateDoc } from "@/lib/postgres-bridge";
import {
  ResumeData,
  PersonalInfo,
  AnalysisResult,
  RESUME_DRAFT_STORAGE_KEY_PREFIX,
  buildDeterministicFallbackAnalysis,
  applyDeterministicScoreGuard,
  normalizeAnalysisResult,
  extractJsonObjectFromText,
} from "@/utils/resumeUtils";

// PDF.js worker setup
let pdfJsPromise: Promise<any> | null = null;
const getPdfJs = async () => {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      return pdfjs;
    });
  }
  return pdfJsPromise;
};

const callOpenAI = async (payload: unknown) => {
  const result = await api.post('/ai/completion', payload);
  return result.data;
};

export function useResumeBuilder() {
  const { user } = useAuth();
  const { settings } = useCollegeSettings();
  const hydratedProfileUidRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<"current" | "upload">("current");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [zoom, setZoom] = useState(0.85);
  const [preview, setPreview] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [hasUnsavedResumeChanges, setHasUnsavedResumeChanges] = useState(false);
  const lastSavedResumeSnapshotRef = useRef<string>("");
  const hasInitializedSaveStateRef = useRef(false);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "ARJUN PATEL",
      location: "Kanpur, Uttar Pradesh",
      email: "arjun.patel@pec.edu",
      phone: "+91 7700454732",
      linkedin: "linkedin.com/in/arjunpatel",
      github: "github.com/arjuncode",
    },
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

  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const getDraftStorageKey = (uid?: string | null) => `${RESUME_DRAFT_STORAGE_KEY_PREFIX}${uid || "guest"}`;

  const readLocalResumeDraft = useCallback((uid?: string | null): ResumeData | null => {
    try {
      const raw = localStorage.getItem(getDraftStorageKey(uid));
      if (!raw) return null;
      return JSON.parse(raw) as ResumeData;
    } catch {
      return null;
    }
  }, []);

  const writeLocalResumeDraft = useCallback((payload: ResumeData, uid?: string | null) => {
    localStorage.setItem(getDraftStorageKey(uid), JSON.stringify(payload));
  }, []);

  useEffect(() => {
    hasInitializedSaveStateRef.current = false;
    lastSavedResumeSnapshotRef.current = "";
    setHasUnsavedResumeChanges(false);

    if (!user) {
      hydratedProfileUidRef.current = null;
      const guestDraft = readLocalResumeDraft(null);
      if (guestDraft) setResumeData(guestDraft);
      setLoading(false);
      return;
    }

    if (hydratedProfileUidRef.current === user.uid) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const localDraft = readLocalResumeDraft(user.uid);
        const profileDoc = await getDoc(doc(({} as any), "studentProfiles", user.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data();
          setResumeData((prev) => {
            const profileSeeded: ResumeData = {
              ...prev,
              personalInfo: {
                name: user.fullName || prev.personalInfo.name,
                email: user.email || prev.personalInfo.email,
                phone: profile.phone || prev.personalInfo.phone,
                location: [profile.city, profile.state].filter(Boolean).join(", ") || prev.personalInfo.location,
                linkedin: profile.linkedinUsername ? `linkedin.com/in/${profile.linkedinUsername}` : prev.personalInfo.linkedin,
                github: profile.githubUsername ? `github.com/${profile.githubUsername}` : prev.personalInfo.github,
              },
              education: [
                {
                  institution: settings?.collegeName || prev.education[0].institution,
                  degree: profile.degree || prev.education[0].degree,
                  major: profile.department || prev.education[0].major,
                  year: profile.batch ? `Expected ${profile.batch.split("-")[1]}` : prev.education[0].year,
                  gpa: profile.cgpa ? `${profile.cgpa}/10.0` : prev.education[0].gpa,
                  honors: "",
                  coursework: prev.education[0].coursework,
                },
              ],
            };
            return localDraft || profileSeeded;
          });
          toast.success("Synced with your profile");
        } else if (localDraft) {
          setResumeData(localDraft);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        hydratedProfileUidRef.current = user.uid;
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid, settings?.collegeName, readLocalResumeDraft]);

  useEffect(() => {
    if (loading) return;
    const snapshot = JSON.stringify(resumeData);
    if (!hasInitializedSaveStateRef.current) {
      lastSavedResumeSnapshotRef.current = snapshot;
      hasInitializedSaveStateRef.current = true;
      setHasUnsavedResumeChanges(false);
      return;
    }
    setHasUnsavedResumeChanges(snapshot !== lastSavedResumeSnapshotRef.current);
  }, [resumeData, loading]);

  const handleSaveResume = async () => {
    if (!hasUnsavedResumeChanges || isSavingResume) return;
    setIsSavingResume(true);
    try {
      writeLocalResumeDraft(resumeData, user?.uid || null);
      if (user?.uid) {
        await updateDoc(doc(({} as any), "studentProfiles", user.uid), {
          phone: resumeData.personalInfo.phone || null,
          address: resumeData.personalInfo.location || null,
        });
      }
      lastSavedResumeSnapshotRef.current = JSON.stringify(resumeData);
      setHasUnsavedResumeChanges(false);
      toast.success("Resume changes saved.");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Could not save resume changes. Please try again.");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
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
      experience: [...prev.experience, {
        company: "Company Name",
        title: "Job Title",
        duration: "Date Range",
        location: "Location",
        description: ["Description bullet point"],
      }],
    }));
  };

  const removeExperience = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));

  const handleExperienceChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.experience];
      (arr[i] as any)[f] = v;
      return { ...prev, experience: arr };
    });
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, {
        name: "Project Name",
        date: "Date",
        description: ["Project description"],
      }],
    }));
  };

  const removeProject = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));

  const handleProjectChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.projects];
      (arr[i] as any)[f] = v;
      return { ...prev, projects: arr };
    });
  };

  const handleSkillsChange = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (error) {
      console.error("Text extraction failed:", error);
      throw new Error("Could not read PDF text.");
    }
  };

  const optimizeImageForVision = async (file: File): Promise<string> => {
    const MAX_IMAGE_BYTES = 850_000;
    const MAX_DIMENSION = 1400;
    const initialDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = initialDataUrl;
    });
    let scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    let quality = 0.82;
    let bestDataUrl = initialDataUrl;
    for (let attempt = 0; attempt < 5; attempt++) {
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");
      ctx.drawImage(image, 0, 0, width, height);
      bestDataUrl = canvas.toDataURL("image/jpeg", quality);
      if (bestDataUrl.length * 0.75 <= MAX_IMAGE_BYTES) return bestDataUrl;
      scale *= 0.82;
      quality = Math.max(0.58, quality - 0.1);
    }
    return bestDataUrl;
  };

  const handleAnalyze = async (customFile?: File) => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    let resumeContext = "";
    const deterministicFallback = () =>
      buildDeterministicFallbackAnalysis(resumeContext || JSON.stringify(resumeData, null, 2), jobDescription);

    try {
      const targetFile = customFile || (selectedResume === "upload" ? uploadedFile : null);
      let userContent: any = "";
      if (targetFile) {
        if (targetFile.type.includes("pdf")) {
          resumeContext = await extractTextFromPDF(targetFile);
        } else {
          const optimizedImageDataUrl = await optimizeImageForVision(targetFile);
          resumeContext = `[IMAGE_RESUME_UPLOAD:${targetFile.name}]`;
          userContent = [
            { type: "text", text: `Analyze this resume image against JD: ${jobDescription}` },
            { type: "image_url", image_url: { url: optimizedImageDataUrl } }
          ];
        }
      } else {
        resumeContext = JSON.stringify(resumeData, null, 2);
      }
      if (!userContent) {
        userContent = `Analyze resume against JD.\nJD: ${jobDescription}\nResume: ${resumeContext}`;
      }
      const response = await callOpenAI({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Expert ATS. Return strictly JSON." },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
      });
      const content = response?.choices?.[0]?.message?.content;
      let normalized = deterministicFallback();
      try {
        const parsed = JSON.parse(extractJsonObjectFromText(content));
        normalized = normalizeAnalysisResult(parsed);
      } catch {}
      setAnalysisResult(applyDeterministicScoreGuard(normalized, resumeContext, jobDescription));
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      console.error("Analysis Error:", error);
      setAnalysisResult(applyDeterministicScoreGuard(deterministicFallback(), resumeContext || JSON.stringify(resumeData, null, 2), jobDescription));
      toast.info("Used fallback analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(resumeData.personalInfo.name.toUpperCase(), 105, yPos, { align: "center" });
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const contactParts = [
      resumeData.personalInfo.location,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.email,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github,
    ].filter(Boolean).join(" | ");
    doc.text(contactParts, 105, yPos, { align: "center" });
    yPos += 10;

    const addSection = (title: string) => {
      doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 14, yPos);
      doc.setLineWidth(0.5); doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 7;
    };

    if (resumeData.education.length > 0) {
      addSection("Education");
      resumeData.education.forEach((edu) => {
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(edu.institution, 14, yPos);
        doc.setFont("helvetica", "normal"); doc.text(edu.year, 196, yPos, { align: "right" });
        yPos += 5;
        doc.setFont("helvetica", "italic"); doc.text(`${edu.degree} in ${edu.major}`, 14, yPos);
        if (edu.gpa) doc.text(`GPA: ${edu.gpa}`, 196, yPos, { align: "right" });
        yPos += 5;
        if (edu.coursework.length > 0) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(9);
          const split = doc.splitTextToSize(`Relevant Coursework: ${edu.coursework.join(", ")}`, 180);
          doc.text(split, 14, yPos); yPos += split.length * 4 + 3;
        }
      });
    }

    if (resumeData.experience.length > 0) {
      addSection("Work Experience");
      resumeData.experience.forEach((exp) => {
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(exp.company, 14, yPos);
        doc.setFont("helvetica", "normal"); doc.text(exp.location, 196, yPos, { align: "right" });
        yPos += 5;
        doc.setFont("helvetica", "italic"); doc.text(exp.title, 14, yPos);
        doc.setFont("helvetica", "normal"); doc.text(exp.duration, 196, yPos, { align: "right" });
        yPos += 5;
        exp.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const split = doc.splitTextToSize(`• ${d}`, 180);
          doc.text(split, 18, yPos); yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

    if (resumeData.projects.length > 0) {
      addSection("Projects");
      resumeData.projects.forEach((proj) => {
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(proj.name, 14, yPos);
        doc.setFont("helvetica", "normal"); doc.text(proj.date, 196, yPos, { align: "right" });
        yPos += 5;
        proj.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const split = doc.splitTextToSize(`• ${d}`, 180);
          doc.text(split, 18, yPos); yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

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
        doc.setFont("helvetica", "bold"); doc.text(`${s.l}:`, 14, yPos);
        doc.setFont("helvetica", "normal");
        const split = doc.splitTextToSize(s.v, 150);
        doc.text(split, 45, yPos); yPos += split.length * 4 + 2;
      }
    });

    doc.save(`${resumeData.personalInfo.name}_Resume.pdf`);
  };

  return {
    loading,
    resumeData,
    setResumeData,
    handlePersonalInfoChange,
    handleEducationChange,
    addExperience,
    removeExperience,
    handleExperienceChange,
    addProject,
    removeProject,
    handleProjectChange,
    handleSkillsChange,
    handleSaveResume,
    isSavingResume,
    hasUnsavedResumeChanges,
    downloadPDF,
    zoom,
    setZoom,
    preview,
    setPreview,
    activeTab,
    setActiveTab,
    jobDescription,
    setJobDescription,
    isAnalyzing,
    analysisResult,
    handleAnalyze,
    selectedResume,
    setSelectedResume,
    uploadedFile,
    setUploadedFile,
    settings,
  };
}
