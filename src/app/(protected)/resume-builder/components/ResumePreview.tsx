'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
        preview ? "xl:col-span-12 relative mx-auto max-w-4xl" : "",
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
              {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
              {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.email && <span className="text-blue-900">• {resumeData.personalInfo.email}</span>}
            </div>
            <div className="text-xs flex flex-wrap justify-center gap-x-3 mt-1 text-blue-800 font-medium">
              {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
              {resumeData.personalInfo.github && <span>{resumeData.personalInfo.github}</span>}
            </div>
          </div>

          {/* Resume Body */}
          <div className="space-y-5">
            {/* Education */}
            <section>
              <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">Education</h2>
              {resumeData.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{edu.institution.toUpperCase()}</span>
                    <span>{edu.year}</span>
                  </div>
                  <div className="flex justify-between text-xs italic">
                    <span>{edu.degree} in {edu.major}</span>
                    <span className="font-semibold">{edu.gpa ? `GPA: ${edu.gpa}` : ""}</span>
                  </div>
                  {edu.coursework.length > 0 && edu.coursework[0] && (
                    <div className="text-xs mt-1.5 leading-relaxed">
                      <span className="font-semibold">Relevant Coursework:</span> {edu.coursework.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">Work Experience</h2>
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
                <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">Projects</h2>
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
              <h2 className="text-xs font-bold text-black border-b border-black mb-2 uppercase tracking-wider pb-0.5">Skills & Interests</h2>
              <div className="text-xs space-y-1.5 leading-normal">
                {resumeData.skills.technical && (
                  <div><span className="font-bold">Technical:</span> {resumeData.skills.technical}</div>
                )}
                {resumeData.skills.programming && (
                  <div><span className="font-bold">Programming:</span> {resumeData.skills.programming}</div>
                )}
                {resumeData.skills.languages && (
                  <div><span className="font-bold">Languages:</span> {resumeData.skills.languages}</div>
                )}
                {resumeData.skills.certifications && (
                  <div><span className="font-bold">Certifications:</span> {resumeData.skills.certifications}</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      {!preview && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          Preview scaled by {Math.round(zoom * 100)}%. Download PDF for actual A4 size.
        </p>
      )}
    </motion.div>
  );
}
