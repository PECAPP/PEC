'use client';

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Upload,
  Trash2,
  Target,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState, StatePanel } from '@/components/common/AsyncState';
import { cn } from '@/lib/utils';

type AnalysisResult = {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
};

type ResumeAnalyzerPanelProps = {
  selectedResume: 'current' | 'upload';
  setSelectedResume: Dispatch<SetStateAction<'current' | 'upload'>>;
  uploadedFile: File | null;
  setUploadedFile: Dispatch<SetStateAction<File | null>>;
  isAnalyzing: boolean;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  analysisResult: AnalysisResult | null;
  onAnalyze: () => void;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

export function ResumeAnalyzerPanel({
  selectedResume,
  setSelectedResume,
  uploadedFile,
  setUploadedFile,
  isAnalyzing,
  jobDescription,
  setJobDescription,
  analysisResult,
  onAnalyze,
}: ResumeAnalyzerPanelProps) {
  return (
    <div className="space-y-6">
      <div className="card-elevated ui-card-pad flex flex-col md:flex-row gap-4 items-center justify-between border-l-2 border-primary bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Analysis Source</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Evaluate Builder Data or an External PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-secondary/40 p-1 rounded-md w-full md:w-auto border border-border">
            <button
              onClick={() => {
                setSelectedResume('current');
                setUploadedFile(null);
              }}
              className={cn(
                'flex-1 md:flex-none px-4 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2',
                selectedResume === 'current'
                  ? 'bg-background shadow-md text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Builder Data
            </button>

            <div className="relative flex-1 md:flex-none">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="resume-upload-field"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                    setSelectedResume('upload');
                    toast.success(`Loaded: ${file.name}`);
                  }
                }}
              />
              <button
                onClick={() => document.getElementById('resume-upload-field')?.click()}
                className={cn(
                  'w-full px-4 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2',
                  selectedResume === 'upload'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadedFile ? uploadedFile.name.substring(0, 10) + '...' : 'Upload PDF'}
              </button>
            </div>
          </div>

          {uploadedFile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setUploadedFile(null);
                setSelectedResume('current');
                toast.info('External file removed');
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="card-elevated ui-card-pad border-t-2 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Job Description</h3>
                <p className="text-xs text-muted-foreground font-medium">Define your target role requirements</p>
              </div>
            </div>

            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here for deep semantic analysis..."
              className="min-h-[280px] bg-muted/20 border border-border focus-visible:ring-1 resize-none leading-relaxed text-sm"
            />

            <Button
              className="w-full mt-6 h-12 text-md font-semibold shadow-sm transition-all duration-150"
              onClick={onAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-3" /> Processing Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3 text-amber-400" /> Run AI Audit
                </>
              )}
            </Button>

            {uploadedFile && selectedResume === 'upload' && !isAnalyzing && (
              <p className="text-[10px] text-center mt-3 text-muted-foreground italic flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-success" />
                Targeting external file: <span className="font-bold text-primary">{uploadedFile.name}</span>
              </p>
            )}
          </div>

          {isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StatePanel
                title="Analyzing resume"
                description="Checking semantic relevance and ATS keyword coverage..."
                className="w-full"
              />
            </motion.div>
          )}
        </div>

        <div className="space-y-6 min-h-[500px]">
          {analysisResult && !isAnalyzing ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="card-elevated ui-card-pad text-center border-b-2 border-primary">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Match Score</p>
                <div className={cn('text-7xl font-black mb-4 font-mono transition-colors', getScoreColor(analysisResult.matchScore))}>
                  {analysisResult.matchScore}%
                </div>
                <Progress value={analysisResult.matchScore} className="h-3 shadow-inner bg-secondary" />
              </div>

              <div className="card-elevated ui-card-pad">
                <h4 className="font-bold text-xs mb-4 flex items-center gap-2 uppercase tracking-tight">
                  <Target className="w-4 h-4 text-primary" /> Industry Keyword Matching
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordMatch.map((keywordMatchItem, index) => (
                    <Badge
                      key={index}
                      variant={keywordMatchItem.found ? 'default' : 'outline'}
                      className={cn(
                        'px-3 py-1 text-[10px] transition-all',
                        keywordMatchItem.found
                          ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
                          : 'opacity-40 grayscale border-dashed',
                      )}
                    >
                      {keywordMatchItem.found ? '✓ ' : '× '}
                      {keywordMatchItem.keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-500/5 border-l-4 border-green-600 p-4 rounded-r-lg shadow-sm ring-1 ring-green-500/10">
                  <h5 className="font-bold text-green-700 text-xs mb-3 flex items-center gap-2 uppercase">
                    <CheckCircle2 className="w-4 h-4" /> Core Strengths
                  </h5>
                  <ul className="text-[11px] space-y-2 text-foreground/80 list-disc ml-4 leading-relaxed">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/5 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm ring-1 ring-red-500/10">
                  <h5 className="font-bold text-red-700 text-xs mb-3 flex items-center gap-2 uppercase">
                    <XCircle className="w-4 h-4" /> Optimization Gaps
                  </h5>
                  <ul className="text-[11px] space-y-2 text-foreground/80 list-disc ml-4 leading-relaxed">
                    {analysisResult.gaps.map((gap, index) => (
                      <li key={index}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card-elevated ui-card-pad bg-primary/5 border border-primary/20 relative overflow-hidden">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-primary uppercase tracking-wider text-xs">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> Strategic AI Suggestions
                </h4>
                <div className="space-y-4">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-3 text-sm leading-relaxed text-foreground/90 group">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-1" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !isAnalyzing ? (
            <EmptyState
              title="Analysis pending"
              description="Paste a job description and run the audit to generate your compatibility report."
              className="min-h-[420px] flex items-center justify-center"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
