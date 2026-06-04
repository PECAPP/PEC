'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { ResumeData } from "@/utils/resumeUtils";

interface ResumePreviewProps {
  resumeData: ResumeData;
  zoom: number;
  preview: boolean;
}

export function ResumePreview({
  resumeData,
  zoom,
  preview,
}: ResumePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "xl:col-span-6",
        preview ? "xl:col-span-12 relative mx-auto max-w-5xl" : "",
      )}
    >
      <div
        className="bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-black/5 origin-top-left transition-all duration-300 ease-out"
        style={{
          width: "8.5in",
          minHeight: "11in",
          transform: preview ? "none" : `scale(${zoom})`,
          transformOrigin: preview ? "top center" : "top left",
          margin: preview ? "0 auto" : "0",
        }}
        id="resume-preview-document"
      >
        <div className="p-[0.6in] relative">
          {/* Subtle Institutional Watermark */}
          <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none">
             <FileText className="w-32 h-32 rotate-12" />
          </div>

          {/* Resume Header */}
          <div className="text-center border-b-2 border-black pb-6 mb-8">
            <h1 className="text-4xl font-bold text-black tracking-tight mb-4">
              {resumeData.personalInfo.name}
            </h1>
            <div className="text-xs flex flex-wrap justify-center gap-x-4 gap-y-2 text-gray-700 font-medium tracking-wide">
              {resumeData.personalInfo.location && (
                <span>
                  {resumeData.personalInfo.location}
                </span>
              )}
              {resumeData.personalInfo.phone && (
                <span>
                  • {resumeData.personalInfo.phone}
                </span>
              )}
              {resumeData.personalInfo.email && (
                <span className="font-semibold text-black">
                  • {resumeData.personalInfo.email}
                </span>
              )}
            </div>
            <div className="text-[10px] flex flex-wrap justify-center gap-x-6 mt-3 text-black/60 font-medium">
              {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
              {resumeData.personalInfo.github && <span>GitHub: {resumeData.personalInfo.github}</span>}
            </div>
          </div>

          {/* Resume Body */}
          <div className="space-y-8">
            {/* Education */}
            <section>
              <h2 className="text-xs font-bold text-black border-b border-black/30 mb-4 uppercase tracking-widest pb-1">Education</h2>
              <div className="space-y-6">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between font-bold text-sm mb-1">
                      <span>{edu.institution}</span>
                      <span className="text-xs">{edu.year}</span>
                    </div>
                    <div className="flex justify-between text-xs italic text-black/80">
                      <span>{edu.degree} in {edu.major}</span>
                      <span className="font-semibold">{edu.gpa ? `GPA: ${edu.gpa}` : ""}</span>
                    </div>
                    {edu.coursework.length > 0 && edu.coursework[0] && (
                      <div className="text-xs mt-2 leading-relaxed text-black/70">
                        <span className="font-semibold">Coursework:</span> {edu.coursework.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black border-b border-black/30 mb-4 uppercase tracking-widest pb-1">Work Experience</h2>
                <div className="space-y-8">
                  {resumeData.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between font-bold text-sm mb-1">
                        <span>{exp.company}</span>
                        <span className="text-xs">{exp.location}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium mb-2 text-black/70">
                        <span>{exp.title}</span>
                        <span>{exp.duration}</span>
                      </div>
                      <ul className="list-disc list-outside ml-6 space-y-2 text-xs leading-relaxed text-black/90">
                        {exp.description.filter(Boolean).map((d, j) => (
                          <li key={j} className="pl-2">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {resumeData.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black border-b border-black/30 mb-4 uppercase tracking-widest pb-1">Projects</h2>
                <div className="space-y-8">
                  {resumeData.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between font-bold text-sm mb-2">
                        <span>{proj.name}</span>
                        <span className="text-xs">{proj.date}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs leading-relaxed text-black/90">
                        {proj.description.filter(Boolean).map((d, j) => (
                          <li key={j} className="pl-1">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            <section>
              <h2 className="text-xs font-bold text-black border-b border-black/30 mb-4 uppercase tracking-widest pb-1">Skills & Interests</h2>
              <div className="grid gap-3 text-xs">
                {resumeData.skills.technical && (
                  <div className="flex gap-4">
                    <span className="font-bold w-32 shrink-0">Technical:</span>
                    <span>{resumeData.skills.technical}</span>
                  </div>
                )}
                {resumeData.skills.programming && (
                  <div className="flex gap-4">
                    <span className="font-bold w-32 shrink-0">Programming:</span>
                    <span>{resumeData.skills.programming}</span>
                  </div>
                )}
                {resumeData.skills.languages && (
                  <div className="flex gap-4">
                    <span className="font-bold w-32 shrink-0">Languages:</span>
                    <span>{resumeData.skills.languages}</span>
                  </div>
                )}
                {resumeData.skills.certifications && (
                  <div className="flex gap-4">
                    <span className="font-bold w-32 shrink-0">Certifications:</span>
                    <span>{resumeData.skills.certifications}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <div className="mt-12 pt-6 border-t border-black/5 text-[8px] font-black uppercase tracking-[0.4em] text-center opacity-20 italic">
            Electronically Generated Verification Factor: {resumeData.personalInfo.name.substring(0,3).toUpperCase()}-{Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>
      </div>
      {!preview && (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-6 italic opacity-50">
          Neural Preview Processed • {Math.round(zoom * 100)}% Scaling Meta
        </p>
      )}
    </motion.div>
  );
}
