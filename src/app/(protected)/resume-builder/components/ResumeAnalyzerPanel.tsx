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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
      <div className="card-elevated p-6 flex flex-col md:flex-row gap-6 items-center justify-between border-2 border-primary/30 bg-card shadow-[8px_8px_0px_rgba(0,0,0,0.05)] rounded-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">Analysis source</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">
              Select builder data or upload an external file
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-muted/40 p-1 rounded-sm w-full md:w-auto border-2 border-border shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => {
                setSelectedResume('current');
                setUploadedFile(null);
              }}
              className={cn(
                'flex-1 md:flex-none px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all',
                selectedResume === 'current'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="w-3.5 h-3.5 mr-2 inline-block" />
              Builder data
            </button>

            <div className="relative flex-1 md:flex-none">
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
                  'w-full px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all',
                  selectedResume === 'upload'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Upload className="w-3.5 h-3.5 mr-2 inline-block" />
                {uploadedFile ? uploadedFile.name.substring(0, 10) + '...' : 'Upload file'}
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
          <div className="card-elevated p-8 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-sm bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tight">Job description</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Requirement parameters</p>
              </div>
            </div>

            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Inject target job directives for deep neural analysis..."
              className="min-h-[300px] bg-background/50 border-2 border-border rounded-sm focus-visible:ring-0 focus:border-primary/50 resize-none leading-relaxed text-sm font-medium transition-all italic"
            />

            <Button
              className="w-full mt-8 h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.25em] text-xs shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-none transition-all rounded-sm"
              onClick={onAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-3" /> Processing Directives...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" /> Bootstrap AI Audit
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
              <div className="card-elevated p-10 text-center border border-primary/20 rounded-sm bg-primary/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">ATS Compatibility Score</p>
                <div className={cn('text-8xl font-bold mb-6 font-mono tracking-tighter transition-colors', getScoreColor(analysisResult.matchScore))}>
                  {analysisResult.matchScore}%
                </div>
                <Progress value={analysisResult.matchScore} className="h-3 border border-border bg-background rounded-sm" />
              </div>

              <div className="card-elevated p-8 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                <h4 className="font-bold text-xs mb-6 flex items-center gap-3 text-muted-foreground uppercase tracking-widest">
                  <Target className="w-4 h-4 text-primary" /> Keyword Analysis
                </h4>
                <div className="flex flex-wrap gap-3">
                  {analysisResult.keywordMatch.map((keywordMatchItem, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn(
                        'px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all',
                        keywordMatchItem.found
                          ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                          : 'opacity-30 grayscale border-dashed border-border',
                      )}
                    >
                      {keywordMatchItem.found ? '✓ ' : '× '}
                      {keywordMatchItem.keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-success/5 border border-success/30 p-6 rounded-sm group transition-all hover:bg-success/10">
                  <h5 className="font-bold text-success text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest">
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
                <div className="bg-destructive/5 border border-destructive/30 p-6 rounded-sm group transition-all hover:bg-destructive/10">
                  <h5 className="font-bold text-destructive text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest">
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

              <div className="card-elevated p-8 bg-primary/5 border border-primary/20 rounded-sm relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h4 className="font-bold flex items-center gap-3 mb-6 text-primary uppercase tracking-widest text-[10px]">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> AI Recommendations
                </h4>
                <div className="grid gap-6">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-4 text-sm leading-relaxed text-foreground/90 font-medium group">
                      <div className="w-6 h-6 shrink-0 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center text-primary text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {index + 1}
                      </div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !isAnalyzing ? (
            <EmptyState
              title="Analysis pending"
              description="Paste a job description and run the audit to generate your alignment report."
              className="min-h-[420px] flex items-center justify-center font-medium"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
