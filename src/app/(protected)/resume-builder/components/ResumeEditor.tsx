'use client';

import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData, PersonalInfo } from "@/utils/resumeUtils";

interface ResumeEditorProps {
  resumeData: ResumeData;
  handlePersonalInfoChange: (field: keyof PersonalInfo, value: string) => void;
  handleEducationChange: (index: number, field: string, value: any) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  handleExperienceChange: (i: number, f: string, v: any) => void;
  addProject: () => void;
  removeProject: (index: number) => void;
  handleProjectChange: (i: number, f: string, v: any) => void;
  handleSkillsChange: (field: string, value: string) => void;
}

export function ResumeEditor({
  resumeData,
  handlePersonalInfoChange,
  handleEducationChange,
  addExperience,
  removeExperience,
  handleExperienceChange,
  addProject,
  removeProject,
  handleProjectChange,
  handleSkillsChange,
}: ResumeEditorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="xl:col-span-6 space-y-6"
    >
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full justify-start overflow-auto no-scrollbar bg-muted/30 border-2 border-border p-1 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
          <TabsTrigger value="personal" className="rounded-sm font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Personal</TabsTrigger>
          <TabsTrigger value="education" className="rounded-sm font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Education</TabsTrigger>
          <TabsTrigger value="experience" className="rounded-sm font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Experience</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-sm font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Projects</TabsTrigger>
          <TabsTrigger value="skills" className="rounded-sm font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="card-elevated p-8 space-y-6 mt-6 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "Full Name", field: "name", placeholder: "Arjun Patel" },
              { label: "Location", field: "location", placeholder: "Chandigarh, India" },
              { label: "Email Address", field: "email", placeholder: "arjun.patel@pec.edu" },
              { label: "Phone Number", field: "phone", placeholder: "+91 0000000000" },
              { label: "LinkedIn URL", field: "linkedin", placeholder: "linkedin.com/in/arjunpatel" },
              { label: "GitHub Profile", field: "github", placeholder: "github.com/arjuncode" }
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                <Input
                  value={(resumeData.personalInfo as any)[field]}
                  onChange={(e) => handlePersonalInfoChange(field as any, e.target.value)}
                  placeholder={placeholder}
                  className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all placeholder:opacity-50"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-6 mt-6">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="card-elevated p-8 space-y-6 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary transition-all" />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Institution</label>
                <Input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                  className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Year of Completion</label>
                  <Input
                    value={edu.year}
                    onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Major/Field of Study</label>
                  <Input
                    value={edu.major}
                    onChange={(e) => handleEducationChange(idx, "major", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">GPA/Grade</label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Relevant Coursework</label>
                <Textarea
                  value={edu.coursework.join(", ")}
                  onChange={(e) => handleEducationChange(idx, "coursework", e.target.value.split(", "))}
                  className="bg-background/50 border border-border rounded-sm focus-visible:ring-1 focus:border-primary transition-all font-medium min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6 mt-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="card-elevated p-8 space-y-6 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary transition-all" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 rounded-sm"
                onClick={() => removeExperience(idx)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Company</label>
                  <Input
                    placeholder="Tech Innovations"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
                  <Input
                    placeholder="Software Engineer"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Duration</label>
                  <Input
                    placeholder="June 2024 - August 2024"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <Input
                    placeholder="Bangalore, India"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Work Description</label>
                <Textarea
                  placeholder="Describe your responsibilities and achievements..."
                  value={exp.description.join("\n")}
                  onChange={(e) => handleExperienceChange(idx, "description", e.target.value.split("\n"))}
                  className="bg-background/50 border border-border rounded-sm focus-visible:ring-1 focus:border-primary transition-all font-medium min-h-[120px]"
                />
              </div>
            </div>
          ))}
          <Button onClick={addExperience} variant="outline" className="w-full h-14 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-sm font-black uppercase tracking-widest text-xs transition-all">
            <Plus className="w-5 h-5 mr-3" /> Initialize New Experience Data
          </Button>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="card-elevated p-8 space-y-6 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary transition-all" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 rounded-sm"
                onClick={() => removeProject(idx)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                  <Input
                    placeholder="Smart Campus App"
                    value={proj.name}
                    onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Completion Date</label>
                  <Input
                    placeholder="Jan 2024"
                    value={proj.date}
                    onChange={(e) => handleProjectChange(idx, "date", e.target.value)}
                    className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Project Details</label>
                <Textarea
                  placeholder="Summarize your project..."
                  value={proj.description.join("\n")}
                  onChange={(e) => handleProjectChange(idx, "description", e.target.value.split("\n"))}
                  className="bg-background/50 border border-border rounded-sm focus-visible:ring-1 focus:border-primary transition-all font-medium min-h-[120px]"
                />
              </div>
            </div>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full h-14 border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-sm font-black uppercase tracking-widest text-xs transition-all">
            <Plus className="w-5 h-5 mr-3" /> Initialize Project Vector
          </Button>
        </TabsContent>

        <TabsContent value="skills" className="card-elevated p-8 space-y-8 mt-6 border-2 border-border rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)] bg-card/50">
          {[
            { label: "Technical Skills", field: "technical", placeholder: "React, Node.js, MongoDB..." },
            { label: "Programming Languages", field: "programming", placeholder: "JavaScript, Python, C++..." },
            { label: "Linguistic Fluency", field: "languages", placeholder: "English, Hindi..." },
            { label: "Certifications", field: "certifications", placeholder: "AWS Certified Developer..." }
          ].map(({ label, field, placeholder }) => (
            <div key={field} className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{label}</label>
              <Input
                value={(resumeData.skills as any)[field]}
                onChange={(e) => handleSkillsChange(field, e.target.value)}
                placeholder={placeholder}
                className="h-10 border rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-primary transition-all placeholder:opacity-50"
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
