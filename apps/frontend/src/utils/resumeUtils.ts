'use client';

// Interfaces
export interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface Education {
  institution: string;
  degree: string;
  major: string;
  year: string;
  gpa: string;
  honors: string;
  coursework: string[];
}

export interface Experience {
  company: string;
  title: string;
  duration: string;
  location: string;
  description: string[];
}

export interface Project {
  name: string;
  date: string;
  description: string[];
}

export interface ResumeData {
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

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
}

// Constants
export const RESUME_DRAFT_STORAGE_KEY_PREFIX = "resume-builder-draft:";

export const PROGRAMMING_LANGUAGE_KEYWORDS = [
  "c", "c++", "c#", "java", "python", "javascript", "typescript", "go", "rust", "kotlin", "swift", "scala", "ruby", "php",
];

export const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  "c": /\bc\s+language\b|(?:^|[\s,;|/()\[\]-])c(?=$|[\s,;|/()\[\]-])/i,
  "c++": /\bc\+\+\b/i,
  "c#": /\bc#\b|\bcsharp\b/i,
  "java": /\bjava\b/i,
  "python": /\bpython\b/i,
  "javascript": /\bjavascript\b/i,
  "typescript": /\btypescript\b/i,
  "go": /\bgolang\b|(?:^|[\s,;|/()\[\]-])go(?=$|[\s,;|/()\[\]-])/i,
  "rust": /\brust\b/i,
  "kotlin": /\bkotlin\b/i,
  "swift": /\bswift\b/i,
  "scala": /\bscala\b/i,
  "ruby": /\bruby\b/i,
  "php": /\bphp\b/i,
};

export const CODING_BASELINE_KEYWORDS = [
  "data structures", "algorithms", "system design", "problem solving", "sql", "rest api", "distributed systems", "testing",
];

export const SDE_ROLE_SIGNAL_KEYWORDS = [
  "data structures", "algorithms", "system design", "distributed systems", "rest api", "microservices", "sql", "testing", "ci/cd", "docker", "kubernetes", "cloud", "node.js", "java", "python", "javascript", "typescript", "react",
];

export const SDE_CORE_KEYWORDS = [
  "data structures", "algorithms", "system design", "object-oriented", "oop", "problem solving", "leetcode",
];

export const KEYWORD_PATTERNS: Record<string, RegExp> = {
  "rest api": /rest(?:ful)?\s+api(?:s)?/i,
  "system design": /system\s+design/i,
  "distributed systems": /distributed\s+systems?/i,
  "data structures": /data\s+structures?/i,
  "algorithms": /algorithms?/i,
  "problem solving": /problem[-\s]?solving/i,
  "object-oriented": /object[-\s]?oriented|\boop\b/i,
  "sql": /\bsql\b|postgresql|mysql|sqlite|mssql/i,
  "testing": /\btesting\b|unit\s+test|integration\s+test/i,
  "ci/cd": /ci\s*\/\s*cd|continuous\s+integration|continuous\s+delivery/i,
  "cloud": /\bcloud\b|aws|gcp|azure/i,
  "node.js": /node\.?js/i,
};

export const STRONG_SDE_SIGNAL_PATTERNS = [
  /leetcode|codeforces|codechef|hackerrank|icpc/i,
  /system\s+design|distributed\s+systems|scalability|high\s+throughput|low\s+latency/i,
  /aws|gcp|azure|kubernetes|docker|microservices/i,
  /\b(50k|100k|1m|million|latency|throughput|p95|p99|sla)\b/i,
];

// Utility Functions
export const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const dedupeTextList = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

export const normalizeTechText = (text: string) =>
  text
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/ci\s*\/\s*cd/g, "cicd")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const hasLanguageMention = (text: string, language: string) => {
  const pattern = LANGUAGE_PATTERNS[language];
  return pattern ? pattern.test(text) : false;
};

export const hasKeywordMention = (text: string, keyword: string) => {
  if (PROGRAMMING_LANGUAGE_KEYWORDS.includes(keyword)) {
    return hasLanguageMention(text, keyword);
  }

  const pattern = KEYWORD_PATTERNS[keyword];
  if (pattern) {
    return pattern.test(text);
  }

  const normalizedText = normalizeTechText(text);
  const normalizedKeyword = normalizeTechText(keyword);
  return normalizedText.includes(normalizedKeyword);
};

export const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export const toKeywordMatchArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as { keyword: string; found: boolean }[];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const keyword = typeof record.keyword === "string" ? record.keyword.trim() : "";
      if (!keyword) return null;
      return {
        keyword,
        found: Boolean(record.found),
      };
    })
    .filter((item): item is { keyword: string; found: boolean } => Boolean(item));
};

export const extractJsonObjectFromText = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

export const isImageResumePlaceholder = (resumeContext: string) =>
  resumeContext.toLowerCase().includes("[image_resume_upload:");

export const buildDeterministicFallbackAnalysis = (
  resumeContext: string,
  jobDescription: string,
): AnalysisResult => {
  const resumeText = resumeContext.toLowerCase();
  const jdText = jobDescription.toLowerCase();
  const imageSource = isImageResumePlaceholder(resumeContext);

  if (imageSource) {
    return {
      matchScore: clampScore(64),
      strengths: ["Resume image was received and prepared for AI vision analysis."],
      gaps: ["AI vision response was unavailable, so this fallback score is conservative."],
      suggestions: [
        "Retry once with the same image after a few seconds.",
        "For highest reliability, upload a text-based PDF resume.",
        "Use a clear, high-contrast screenshot with all resume sections visible.",
      ],
      keywordMatch: CODING_BASELINE_KEYWORDS.map((keyword) => ({ keyword, found: false })),
    };
  }

  const targetedKeywords = Array.from(
    new Set(
      [
        ...PROGRAMMING_LANGUAGE_KEYWORDS,
        ...SDE_ROLE_SIGNAL_KEYWORDS,
        ...CODING_BASELINE_KEYWORDS,
      ].filter((keyword) => hasKeywordMention(jdText, keyword)),
    ),
  );

  const keywordUniverse =
    targetedKeywords.length > 0
      ? targetedKeywords.slice(0, 14)
      : CODING_BASELINE_KEYWORDS.slice(0, 8);

  const keywordMatch = keywordUniverse.map((keyword) => ({
    keyword,
    found: hasKeywordMention(resumeText, keyword),
  }));

  const matchedCount = keywordMatch.filter((item) => item.found).length;
  const coverage = keywordMatch.length > 0 ? matchedCount / keywordMatch.length : 0;
  const knownLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(resumeText, lang),
  );
  const isVagueJd = jobDescription.trim().split(/\s+/).filter(Boolean).length < 6;

  let score = 20 + coverage * 60 + Math.min(knownLanguages.length, 4) * 4;
  if (isVagueJd) score = Math.min(score, 68);

  const strengths = keywordMatch
    .filter((item) => item.found)
    .slice(0, 4)
    .map((item) => `Resume includes ${item.keyword} relevant to the target role.`);

  const gaps = keywordMatch
    .filter((item) => !item.found)
    .slice(0, 4)
    .map((item) => `Missing or weak evidence for ${item.keyword}.`);

  return {
    matchScore: clampScore(score),
    strengths:
      strengths.length > 0
        ? strengths
        : ["Limited direct match signals were detected in the uploaded resume."],
    gaps:
      gaps.length > 0
        ? gaps
        : ["Add more role-specific depth and measurable impact for stronger matching."],
    suggestions: [
      "Add quantified impact bullets with scale, latency, or throughput metrics.",
      "Mirror the job description keywords in projects and experience sections.",
      "Include explicit language/tool evidence for each core requirement.",
    ],
    keywordMatch,
  };
};

export const normalizeAnalysisResult = (raw: unknown): AnalysisResult => {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const keywordMatch = toKeywordMatchArray(record.keywordMatch);
  const numericScore = Number(record.matchScore);
  const derivedScore =
    keywordMatch.length > 0
      ? Math.round((keywordMatch.filter((entry) => entry.found).length / keywordMatch.length) * 100)
      : 0;

  const strengths = toStringArray(record.strengths);
  const gaps = toStringArray(record.gaps);
  const suggestions = toStringArray(record.suggestions);

  return {
    matchScore: clampScore(Number.isFinite(numericScore) ? numericScore : derivedScore),
    strengths: strengths.length > 0 ? strengths : ["No clear strengths were extracted from the AI response."],
    gaps: gaps.length > 0 ? gaps : ["Unable to extract complete analysis details from the AI response."],
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["Try running the audit again with a full job description for a more reliable score."],
    keywordMatch,
  };
};

export const applyDeterministicScoreGuard = (
  analysis: AnalysisResult,
  resumeContext: string,
  jobDescription: string,
): AnalysisResult => {
  if (isImageResumePlaceholder(resumeContext)) {
    const normalizedGaps = dedupeTextList(analysis.gaps);
    if (normalizedGaps.length === 0) {
      normalizedGaps.push("Image-based analysis has lower confidence than text extraction.");
    }
    return {
      ...analysis,
      matchScore: clampScore(analysis.matchScore),
      gaps: normalizedGaps,
      suggestions: dedupeTextList(analysis.suggestions),
    };
  }

  const resumeText = resumeContext.toLowerCase();
  const jdText = jobDescription.toLowerCase();
  const jdWordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const isCodingRole =
    /(\bsde\b|software\s+engineer|software\s+developer|backend|frontend|full\s*stack)/i.test(
      jobDescription,
    );
  const demandsHighScale =
    /(scalability|high\s+throughput|low\s+latency|distributed\s+systems?|system\s+design)/i.test(
      jdText,
    );
  const isVagueJd = jdWordCount < 6 || jobDescription.trim().length < 30;

  if (!isCodingRole) {
    return analysis;
  }

  const jdLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(jdText, lang),
  );
  const jdRoleSignals = SDE_ROLE_SIGNAL_KEYWORDS.filter((keyword) =>
    hasKeywordMention(jdText, keyword),
  );
  const knownLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(resumeText, lang),
  );
  const matchedRoleSignals = jdRoleSignals.filter((keyword) =>
    hasKeywordMention(resumeText, keyword),
  );
  const roleSignalCoverage =
    jdRoleSignals.length > 0
      ? matchedRoleSignals.length / jdRoleSignals.length
      : 0;
  const hasCoreSdeSignal = SDE_CORE_KEYWORDS.some((kw) => resumeText.includes(kw));

  let penalty = 0;
  const gaps = [...analysis.gaps];
  const suggestions = [...analysis.suggestions];

  if (isVagueJd) {
    penalty += 14;
    gaps.push("Job description is too short for reliable evaluation.");
    suggestions.push("Paste the full SDE job description (responsibilities, required skills, and qualifications) for a rigorous score.");
  }

  if (knownLanguages.length === 0) {
    penalty += 18;
    gaps.push("No programming language evidence found for a software engineering role.");
    suggestions.push("Add a Programming Languages section with your strongest coding languages and projects using them.");
  }

  if (jdLanguages.length > 0) {
    const matchedRequiredLanguages = jdLanguages.filter((lang) =>
      hasLanguageMention(resumeText, lang),
    );
    if (matchedRequiredLanguages.length === 0) {
      penalty += 12;
      gaps.push(
        `Job description requires specific languages (${jdLanguages.join(", ")}), but none were found in the resume.`,
      );
    } else if (matchedRequiredLanguages.length < Math.ceil(jdLanguages.length / 2)) {
      penalty += 5;
      gaps.push("Only a small subset of required programming languages appears in the resume.");
    }
  }

  if (!hasCoreSdeSignal) {
    penalty += 7;
    suggestions.push("Highlight Data Structures, Algorithms, and problem-solving experience for SDE screening.");
  }

  if (jdRoleSignals.length >= 3 && roleSignalCoverage < 0.35) {
    penalty += 8;
    gaps.push("Resume has low coverage of role-specific SDE signals required in the job description.");
  }

  if (demandsHighScale) {
    const strongSignalCount = STRONG_SDE_SIGNAL_PATTERNS.filter((pattern) =>
      pattern.test(resumeContext),
    ).length;
    if (strongSignalCount === 0) {
      penalty += 12;
      gaps.push("No strong evidence for high-scale engineering requirements in the job description (scalable systems or quantified impact).");
      suggestions.push("Add quantified impact, DSA/problem-solving achievements, and scalable backend/project evidence aligned to this role.");
    } else if (strongSignalCount === 1) {
      penalty += 4;
      gaps.push("This role asks for high-scale engineering depth; only one strong signal is visible.");
    }
  }

  const guardedScore = clampScore(analysis.matchScore - penalty);
  const keywordMap = new Map<string, { keyword: string; found: boolean }>();

  analysis.keywordMatch.forEach((item) => {
    const keyword = item.keyword.trim();
    if (!keyword) return;
    const key = keyword.toLowerCase();
    keywordMap.set(key, {
      keyword,
      found: hasKeywordMention(resumeText, key),
    });
  });

  jdLanguages.forEach((lang) => {
    const key = lang.toLowerCase();
    if (!keywordMap.has(key)) {
      keywordMap.set(key, { keyword: lang, found: hasLanguageMention(resumeText, lang) });
    }
  });

  CODING_BASELINE_KEYWORDS.forEach((keyword) => {
    const key = keyword.toLowerCase();
    if (!keywordMap.has(key)) {
      keywordMap.set(key, { keyword, found: hasKeywordMention(resumeText, key) });
    }
  });

  let adjustedScore = guardedScore;
  if (isVagueJd) {
    adjustedScore = Math.min(adjustedScore, 72);
  }
  if (jdLanguages.length > 0) {
    const matchedRequiredLanguages = jdLanguages.filter((lang) =>
      hasLanguageMention(resumeText, lang),
    );
    if (matchedRequiredLanguages.length === 0) {
      adjustedScore = Math.min(adjustedScore, 58);
    }
  }
  if (jdRoleSignals.length >= 3) {
    if (roleSignalCoverage < 0.2) {
      adjustedScore = Math.min(adjustedScore, 58);
    } else if (roleSignalCoverage < 0.35) {
      adjustedScore = Math.min(adjustedScore, 72);
    }
  }
  if (demandsHighScale && knownLanguages.length < 2) {
    adjustedScore = Math.min(adjustedScore, 64);
  }

  const normalizedGaps = dedupeTextList(gaps);
  if (normalizedGaps.length === 0) {
    normalizedGaps.push("Resume lacks role-specific depth expected for this target SDE role.");
  }

  return {
    ...analysis,
    matchScore: adjustedScore,
    gaps: normalizedGaps,
    suggestions: dedupeTextList(suggestions),
    keywordMatch: Array.from(keywordMap.values()),
  };
};
