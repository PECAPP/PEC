import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Sparkles,ArrowRight, Target, Lightbulb, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import OpenAI from 'openai';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from '@/config/firebase';

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
}

const storage = getStorage(app);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true, 
  baseURL:"https://models.github.ai/inference"
});

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedResume, setSelectedResume] = useState<'current' | 'upload'>('current');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let resumeData: string;

      if (selectedResume === 'upload' && uploadedFile) {
        resumeData = await fileToBase64(uploadedFile);
      } else {
        const resumeRef = ref(storage, 'resumes/current_erp_resume.pdf');
        const url = await getDownloadURL(resumeRef);
        const response = await fetch(url);
        const blob = await response.blob();
        resumeData = await fileToBase64(blob);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert ATS (Applicant Tracking System). Analyze resumes against job descriptions and return strictly JSON."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this resume against the following job description: "${jobDescription}". 
                Return a JSON object:
                {
                  "matchScore": number,
                  "strengths": string[],
                  "gaps": string[],
                  "suggestions": string[],
                  "keywordMatch": [{"keyword": string, "found": boolean}]
                }` 
              },
            ],
          },
        ],
        response_format: { type: "json_object" } 
      });

      const content = response.choices[0].message.content;
      if (content) {
        setAnalysisResult(JSON.parse(content) as AnalysisResult);
      }
      
    } catch (error) {
      console.error("OpenAI Error:", error);
      alert("Analysis failed. Check your API key or billing balance.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">OpenAI Resume Insights</h1>
        <p className="text-muted-foreground">Powered by GPT-4o analysis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="card-elevated p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resume Source</h3>
            <div className="grid gap-3">
              <button
                onClick={() => setSelectedResume('current')}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                  selectedResume === 'current' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <FileText className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="font-bold">Default Resume</p>
                  <p className="text-xs text-muted-foreground">ERP Profile Data</p>
                </div>
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="resume-upload" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setUploadedFile(file); setSelectedResume('upload'); }
                  }} 
                />
                <button
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all',
                    selectedResume === 'upload' ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-bold">{uploadedFile ? uploadedFile.name : 'Upload PDF'}</p>
                    <p className="text-xs text-muted-foreground">Click to browse files</p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <section className="card-elevated p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Job Details</h3>
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[250px] bg-muted/30 border-primary focus-visible:ring-1"
            />
            <Button 
              className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription}
            >
              {isAnalyzing ? <RefreshCw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              {isAnalyzing ? "Analyzing..." : "Analyze with GPT-4"}
            </Button>
          </section>
        </div>

        <div className="space-y-4">
          {!analysisResult && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="w-10 h-10" />
              </div>
              <p>Upload a resume and paste a job description to begin</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="card-elevated p-12 text-center animate-pulse">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold">GPT is Thinking...</h3>
              <p className="text-muted-foreground mt-2">Extracting skills and matching keywords</p>
            </div>
          )}

          {analysisResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="card-elevated p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Compatibility</p>
                <div className={cn("text-6xl font-black mb-4", getScoreColor(analysisResult.matchScore))}>
                  {analysisResult.matchScore}%
                </div>
                <Progress value={analysisResult.matchScore} className="h-3" />
              </div>

              <div className="card-elevated p-5">
                <h4 className="font-bold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /> Keyword Analysis</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordMatch.map((k, i) => (
                    <Badge key={i} variant={k.found ? "default" : "outline"} className={cn(k.found ? "bg-success hover:bg-success" : "opacity-50")}>
                      {k.keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-elevated p-4 border-l-4 border-success">
                  <h5 className="font-bold text-success text-sm mb-2">Strengths</h5>
                  <ul className="text-xs space-y-1">
                    {analysisResult.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="card-elevated p-4 border-l-4 border-destructive">
                  <h5 className="font-bold text-destructive text-sm mb-2">Missing</h5>
                  <ul className="text-xs space-y-1">
                    {analysisResult.gaps.map((g, i) => <li key={i}>• {g}</li>)}
                  </ul>
                </div>
              </div>

              <div className="card-elevated p-5 bg-primary/5 border-none">
                <h4 className="font-bold flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-primary" /> Optimization Tips</h4>
                <div className="space-y-2">
                  {analysisResult.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-2 text-sm text-foreground/80">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}