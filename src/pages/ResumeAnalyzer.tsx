import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
}

const mockAnalysis: AnalysisResult = {
  matchScore: 78,
  strengths: [
    'Strong technical skills in Python and Machine Learning',
    'Relevant internship experience at top tech companies',
    'Good academic record (CGPA 8.78)',
    'Open source contributions demonstrate initiative',
    'Published research shows depth of knowledge',
  ],
  gaps: [
    'Limited experience with cloud platforms mentioned in JD',
    'No mention of team leadership experience',
    'Missing certifications in AWS/GCP',
    'Could highlight more quantifiable achievements',
  ],
  suggestions: [
    'Add AWS/GCP certifications to strengthen cloud skills',
    'Quantify impact: "Improved model accuracy by 15%" → add context',
    'Include leadership examples from college projects',
    'Add keywords: "scalable systems", "distributed computing"',
    'Highlight any experience with large-scale data processing',
  ],
  keywordMatch: [
    { keyword: 'Python', found: true },
    { keyword: 'Machine Learning', found: true },
    { keyword: 'TensorFlow', found: true },
    { keyword: 'AWS', found: false },
    { keyword: 'Distributed Systems', found: false },
    { keyword: 'Leadership', found: false },
    { keyword: 'Data Structures', found: true },
    { keyword: 'Problem Solving', found: true },
  ],
};

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedResume, setSelectedResume] = useState<string | null>('current');

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Compare your resume against job descriptions to improve your chances
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Resume Selection */}
          <div className="card-elevated p-5">
            <h3 className="font-semibold text-foreground mb-4">Select Resume</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedResume('current')}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all',
                  selectedResume === 'current'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Current ERP Resume</p>
                    <p className="text-sm text-muted-foreground">Auto-generated from your profile</p>
                  </div>
                  {selectedResume === 'current' && (
                    <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedResume('upload')}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all border-dashed',
                  selectedResume === 'upload'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload Custom Resume</p>
                    <p className="text-sm text-muted-foreground">PDF or DOCX format</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div className="card-elevated p-5">
            <h3 className="font-semibold text-foreground mb-4">Job Description</h3>
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <Button
              className="w-full mt-4"
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Match
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {!analysisResult && !isAnalyzing && (
            <div className="card-elevated p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-foreground mb-2">Ready to Analyze</h3>
              <p className="text-sm text-muted-foreground">
                Paste a job description and click "Analyze Match" to see how well your resume
                fits the role.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="card-elevated p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              <h3 className="font-medium text-foreground mb-2">Analyzing Your Resume</h3>
              <p className="text-sm text-muted-foreground">
                Our AI is comparing your profile against the job requirements...
              </p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Match Score */}
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Match Score</h3>
                    <p className="text-sm text-muted-foreground">
                      {getScoreLabel(analysisResult.matchScore)}
                    </p>
                  </div>
                  <div className={cn('text-4xl font-bold', getScoreColor(analysisResult.matchScore))}>
                    {analysisResult.matchScore}%
                  </div>
                </div>
                <Progress value={analysisResult.matchScore} className="h-3" />
              </div>

              {/* Keyword Match */}
              <div className="card-elevated p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Keyword Match
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordMatch.map((item) => (
                    <Badge
                      key={item.keyword}
                      variant="outline"
                      className={cn(
                        'gap-1',
                        item.found
                          ? 'border-success/50 text-success bg-success/5'
                          : 'border-destructive/50 text-destructive bg-destructive/5'
                      )}
                    >
                      {item.found ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {item.keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="card-elevated p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="card-elevated p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {analysisResult.gaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="card-elevated p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  AI Suggestions
                </h3>
                <ul className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                    >
                      <ArrowRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
