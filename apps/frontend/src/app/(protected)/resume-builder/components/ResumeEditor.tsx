'use client';
import { Button, Input, Textarea, Tabs, TabsContent, TabsList, TabsTrigger } from "@pec/ui";
import { motion } from "framer-motion";
import { Plus, Trash2, User, GraduationCap, Briefcase, Code2, BadgeCheck } from "lucide-react";
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
      className="xl:col-span-6 space-y-6 min-w-0"
    >
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Education
          </TabsTrigger>
          <TabsTrigger value="experience">
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="skills">
            <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6 mt-0">
          <div className="space-y-6 relative group pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "Full Name", field: "name", placeholder: "Arjun Patel" },
              { label: "Location", field: "location", placeholder: "Chandigarh, India" },
              { label: "Email Address", field: "email", placeholder: "arjun.patel@pec.edu" },
              { label: "Phone Number", field: "phone", placeholder: "+91 0000000000" },
              { label: "LinkedIn URL", field: "linkedin", placeholder: "linkedin.com/in/arjunpatel" },
              { label: "GitHub Profile", field: "github", placeholder: "github.com/arjuncode" }
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 tracking-wide">{label}</label>
                <Input
                  value={(resumeData.personalInfo as any)[field]}
                  onChange={(e) => handlePersonalInfoChange(field as any, e.target.value)}
                  placeholder={placeholder}
                  className="h-10 border border-border/50 rounded-sm bg-background/50 font-medium focus-visible:ring-1 focus:border-border/40 transition-all placeholder:opacity-50"
                />
              </div>
            ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-6 mt-0">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="space-y-6 relative group pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 tracking-wide">Institution</label>
                <Input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                  className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Year of Completion</label>
                  <Input
                    value={edu.year}
                    onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Major/Field of Study</label>
                  <Input
                    value={edu.major}
                    onChange={(e) => handleEducationChange(idx, "major", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">GPA/Grade</label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 tracking-wide">Relevant Coursework</label>
                <Textarea
                  value={edu.coursework.join(", ")}
                  onChange={(e) => handleEducationChange(idx, "coursework", e.target.value.split(", "))}
                  className="bg-background border border-border/50 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all font-medium min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6 mt-0">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="space-y-6 relative group pt-2">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 text-destructive hover:bg-destructive/10 rounded-sm"
                onClick={() => removeExperience(idx)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Company</label>
                  <Input
                    placeholder="Tech Innovations"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Job Title</label>
                  <Input
                    placeholder="Software Engineer"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Duration</label>
                  <Input
                    placeholder="June 2024 - August 2024"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Location</label>
                  <Input
                    placeholder="Bangalore, India"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 tracking-wide">Work Description</label>
                <Textarea
                  placeholder="Describe your responsibilities and achievements..."
                  value={exp.description.join("\n")}
                  onChange={(e) => handleExperienceChange(idx, "description", e.target.value.split("\n"))}
                  className="bg-background border border-border/50 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all font-medium min-h-[120px]"
                />
              </div>
            </div>
          ))}
          <Button onClick={addExperience} variant="outline" className="w-full h-14 border border-dashed border-border/40 hover:border-border/40 hover:bg-primary/5 rounded-sm font-bold text-xs transition-all mt-4">
            <Plus className="w-5 h-5 mr-3" /> Add New Experience
          </Button>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-0">
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="space-y-6 relative group pt-2">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 text-destructive hover:bg-destructive/10 rounded-sm"
                onClick={() => removeProject(idx)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Project Name</label>
                  <Input
                    placeholder="Smart Campus App"
                    value={proj.name}
                    onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-200 tracking-wide">Completion Date</label>
                  <Input
                    placeholder="Jan 2024"
                    value={proj.date}
                    onChange={(e) => handleProjectChange(idx, "date", e.target.value)}
                    className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-200 tracking-wide">Project Details</label>
                <Textarea
                  placeholder="Summarize your project..."
                  value={proj.description.join("\n")}
                  onChange={(e) => handleProjectChange(idx, "description", e.target.value.split("\n"))}
                  className="bg-background border border-border/50 rounded-sm focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all font-medium min-h-[120px]"
                />
              </div>
            </div>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full h-14 border border-dashed border-border/40 hover:border-border/40 hover:bg-primary/5 rounded-sm font-bold text-xs transition-all mt-4">
            <Plus className="w-5 h-5 mr-3" /> Add Project
          </Button>
        </TabsContent>

        <TabsContent value="skills" className="space-y-8 mt-0">
          <div className="space-y-6 relative group pt-2">
          {[
            { label: "Technical Skills", field: "technical", placeholder: "React, Node.js, MongoDB..." },
            { label: "Programming Languages", field: "programming", placeholder: "JavaScript, Python, C++..." },
            { label: "Tools & Technologies", field: "tools", placeholder: "Git, Docker, AWS..." },
          ].map((skillItem, idx) => (
            <div key={idx} className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-200 tracking-wide">{skillItem.label}</label>
              <Input
                placeholder={skillItem.placeholder}
                value={(resumeData.skills as any)[skillItem.field]}
                onChange={(e) => handleSkillsChange(skillItem.field, e.target.value)}
                className="h-10 border border-border/50 rounded-sm bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
