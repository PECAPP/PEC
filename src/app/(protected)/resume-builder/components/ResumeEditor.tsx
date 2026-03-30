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
        <TabsList className="w-full justify-start overflow-auto no-scrollbar bg-muted/40 border border-border p-1">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="card-elevated ui-card-pad space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={resumeData.personalInfo.name}
                onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={resumeData.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={resumeData.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={resumeData.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn</label>
              <Input
                value={resumeData.personalInfo.linkedin}
                onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub</label>
              <Input
                value={resumeData.personalInfo.github}
                onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-4">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="card-elevated ui-card-pad space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    value={edu.year}
                    onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Major</label>
                  <Input
                    value={edu.major}
                    onChange={(e) => handleEducationChange(idx, "major", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GPA</label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Relevant Coursework</label>
                <Textarea
                  value={edu.coursework.join(", ")}
                  onChange={(e) => handleEducationChange(idx, "coursework", e.target.value.split(", "))}
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="experience" className="space-y-4 mt-4">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="card-elevated ui-card-pad space-y-4 relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-destructive"
                onClick={() => removeExperience(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                />
                <Input
                  placeholder="Title"
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                />
                <Input
                  placeholder="Date Range"
                  value={exp.duration}
                  onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                />
                <Input
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={exp.description.join("\n")}
                onChange={(e) => handleExperienceChange(idx, "description", e.target.value.split("\n"))}
              />
            </div>
          ))}
          <Button onClick={addExperience} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-4">
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="card-elevated ui-card-pad space-y-4 relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-destructive"
                onClick={() => removeProject(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                />
                <Input
                  placeholder="Date"
                  value={proj.date}
                  onChange={(e) => handleProjectChange(idx, "date", e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={proj.description.join("\n")}
                onChange={(e) => handleProjectChange(idx, "description", e.target.value.split("\n"))}
              />
            </div>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </TabsContent>

        <TabsContent value="skills" className="card-elevated ui-card-pad space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Technical Skills</label>
            <Input
              value={resumeData.skills.technical}
              onChange={(e) => handleSkillsChange("technical", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Programming</label>
            <Input
              value={resumeData.skills.programming}
              onChange={(e) => handleSkillsChange("programming", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Languages</label>
            <Input
              value={resumeData.skills.languages}
              onChange={(e) => handleSkillsChange("languages", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Certifications</label>
            <Input
              value={resumeData.skills.certifications}
              onChange={(e) => handleSkillsChange("certifications", e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
