'use client';
import { Button, Textarea, Badge, Progress } from "@pec/ui";


import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Trash2,
  Target,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Briefcase,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState, StatePanel } from '@/components/common/AsyncState';
import { cn } from '@/lib/utils';

import { AnalysisResult } from '@/utils/resumeUtils';

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
  analysisNotes: string;
  setAnalysisNotes: Dispatch<SetStateAction<string>>;
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
  analysisNotes,
  setAnalysisNotes,
}: ResumeAnalyzerPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Input */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Resume Source Panel */}
          <div className="card-elevated p-4 md:p-6 border border-border rounded-sm shadow-sm bg-card/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg tracking-tight mb-2 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" /> Resume Source
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold mb-6">
              Select the resume to evaluate
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <div className="flex bg-muted/40 p-1 rounded-sm w-full border border-border shadow-sm">
                <button
                  onClick={() => {
                    setSelectedResume('current');
                    setUploadedFile(null);
                  }}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-sm text-sm font-medium transition-all',
                    selectedResume === 'current'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <FileText className="w-3.5 h-3.5 mr-2 inline-block" />
                  Builder data
                </button>

                <div className="relative flex-1">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
                    className="hidden"
                    id="resume-upload-field"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        setSelectedResume('upload');
                        toast.success(`Identity loaded: ${file.name}`);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('resume-upload-field')?.click()}
                    className={cn(
                      'w-full px-3 py-2 rounded-sm text-sm font-medium transition-all',
                      selectedResume === 'upload'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Upload className="w-3.5 h-3.5 mr-2 inline-block" />
                    Upload
                  </button>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-2 px-3 border border-border/40 rounded-sm bg-muted/20">
                  <span className="text-xs font-medium truncate max-w-[200px]">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setUploadedFile(null);
                      setSelectedResume('current');
                      toast.info('External file removed');
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Job Requirements Panel */}
          <div className="card-elevated p-4 md:p-6 border border-border rounded-sm shadow-sm bg-card/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg tracking-tight mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Target Role
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold mb-6">Target position description</p>

            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or specific requirements here..."
              className="min-h-[160px] bg-background/50 border border-border rounded-sm focus-visible:ring-0 focus:border-border/40 resize-none leading-relaxed text-sm font-medium transition-all"
            />

            <Button
              className="w-full mt-6 h-12 bg-primary text-primary-foreground font-bold tracking-wide text-sm shadow-sm hover:translate-y-[-2px] hover:shadow-sm active:translate-y-[1px] active:shadow-none transition-all rounded-sm"
              onClick={onAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Evaluating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" /> Evaluate Alignment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="xl:col-span-8 space-y-6 min-h-[500px]">
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StatePanel
                title="Evaluating Profile"
                description="Checking requirement alignment and keyword coverage..."
                className="w-full"
              />
            </motion.div>
          )}
          {analysisResult && !isAnalyzing ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="card-elevated p-10 text-center border border-border/40 rounded-sm bg-primary/5">
                <p className="text-sm font-medium text-muted-foreground  mb-4">Alignment Score</p>
                <div className={cn('text-8xl font-bold mb-6 font-mono tracking-tighter transition-colors', getScoreColor(analysisResult.matchScore))}>
                  {analysisResult.matchScore}%
                </div>
                <Progress value={analysisResult.matchScore} className="h-3 border border-border bg-background rounded-sm" />
              </div>

              <div className="card-elevated p-4 md:p-6 border border-border rounded-sm shadow-sm">
                <h4 className="font-bold text-xs mb-6 flex items-center gap-3 text-muted-foreground ">
                  <Target className="w-4 h-4 text-primary" /> Keyword Analysis
                </h4>
                <div className="flex flex-wrap gap-3">
                  {analysisResult.keywordMatch.map((keywordMatchItem, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium  rounded-sm border transition-all',
                        keywordMatchItem.found
                          ? 'bg-primary/10 text-primary border-border/40 shadow-sm'
                          : 'opacity-30 grayscale border-dashed border-border',
                      )}
                    >
                      {keywordMatchItem.found ? ' ' : '× '}
                      {keywordMatchItem.keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-3 md:p-6 rounded-lg border border-success/20 bg-success/5 group transition-all hover:bg-success/10">
                  <h5 className="font-bold text-success text-[10px] mb-4 flex items-center gap-2 ">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h5>
                  <ul className="text-xs space-y-2 text-foreground/80 list-none ml-0 leading-relaxed font-medium">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="flex gap-3 pl-1">
                        <span className="text-success mt-0.5 opacity-60">/</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 md:p-6 rounded-lg border border-destructive/20 bg-destructive/5 group transition-all hover:bg-destructive/10">
                  <h5 className="font-bold text-destructive text-[10px] mb-4 flex items-center gap-2 ">
                    <XCircle className="w-4 h-4" /> Improvement Areas
                  </h5>
                  <ul className="text-xs space-y-2 text-foreground/80 list-none ml-0 leading-relaxed font-medium">
                    {analysisResult.gaps.map((gap, index) => (
                      <li key={index} className="flex gap-3 pl-1">
                        <span className="text-destructive mt-0.5 opacity-60">/</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card-elevated p-4 md:p-6 bg-primary/5 border border-border/40 rounded-sm relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h4 className="font-bold flex items-center gap-3 mb-6 text-primary  text-[10px]">
                  <ClipboardCheck className="w-5 h-5" /> Improvement Suggestions
                </h4>
                <div className="grid gap-6">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-4 text-sm leading-relaxed text-foreground/90 font-medium group">
                      <div className="w-6 h-6 shrink-0 bg-primary/10 border border-border/40 rounded-sm flex items-center justify-center text-primary text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {index + 1}
                      </div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xs flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4 text-primary" /> Analysis Notes
                  </h4>
                  <Badge variant="outline" className="text-[10px]">Editable</Badge>
                </div>
                <Textarea
                  value={analysisNotes}
                  onChange={(e) => setAnalysisNotes(e.target.value)}
                  placeholder="Append custom notes, recruiter feedback, or personal action items here..."
                  className="min-h-[120px] bg-background/50 border border-border rounded-sm focus-visible:ring-0 focus:border-border/40 resize-none text-sm font-medium transition-all"
                />
              </div>
            </motion.div>
          ) : !isAnalyzing ? (
            <EmptyState
              title="Evaluation Pending"
              description="Provide the target job requirements to evaluate the profile's alignment."
              className="h-full min-h-[420px] flex items-center justify-center font-medium"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
