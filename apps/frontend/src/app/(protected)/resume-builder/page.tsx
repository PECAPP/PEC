'use client';
import { FileText, Sparkles } from "lucide-react";
import { LoadingGrid } from "@/components/common/AsyncState";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";

// Modular Components
import { ResumeHeader } from "./components/ResumeHeader";
import { ResumeEditor } from "./components/ResumeEditor";
import { ResumePreview } from "./components/ResumePreview";
import dynamic from "next/dynamic";

import { Tabs, TabsList, TabsTrigger } from "@pec/ui";

const ResumeAnalyzerPanel = dynamic(
  () => import("./components/ResumeAnalyzerPanel").then((mod) => mod.ResumeAnalyzerPanel),
  {
    ssr: false,
    loading: () => <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 min-h-[320px] animate-pulse" />,
  },
);

export default function ResumeBuilderIvyLeague() {
  const {
    loading,
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
    handleSaveResume,
    isSavingResume,
    hasUnsavedResumeChanges,
    downloadPDF,
    zoom,
    setZoom,
    preview,
    setPreview,
    activeTab,
    setActiveTab,
    jobDescription,
    setJobDescription,
    isAnalyzing,
    analysisResult,
    handleAnalyze,
    selectedResume,
    setSelectedResume,
    uploadedFile,
    setUploadedFile,
    settings,
    analysisNotes,
    setAnalysisNotes,
  } = useResumeBuilder();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 bg-muted rounded-sm animate-pulse" />
        <LoadingGrid count={3} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" itemClassName="h-48 rounded-sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 w-full">
      <ResumeHeader
        _settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        zoom={zoom}
        setZoom={setZoom}
        preview={preview}
        setPreview={setPreview}
        hasUnsavedResumeChanges={hasUnsavedResumeChanges}
        isSavingResume={isSavingResume}
        handleSaveResume={handleSaveResume}
        downloadPDF={downloadPDF}
      />

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="builder"><FileText className="w-3.5 h-3.5 mr-1.5" />Builder</TabsTrigger>
              <TabsTrigger value="analyzer"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Evaluation</TabsTrigger>
            </TabsList>
          </div>
        {activeTab === "builder" && (
          <div className="grid xl:grid-cols-12 gap-8 items-start">
            {!preview && (
              <ResumeEditor
                resumeData={resumeData}
                handlePersonalInfoChange={handlePersonalInfoChange}
                handleEducationChange={handleEducationChange}
                addExperience={addExperience}
                removeExperience={removeExperience}
                handleExperienceChange={handleExperienceChange}
                addProject={addProject}
                removeProject={removeProject}
                handleProjectChange={handleProjectChange}
                handleSkillsChange={handleSkillsChange}
              />
            )}

            <ResumePreview
              resumeData={resumeData}
              zoom={zoom}
              preview={preview}
            />
          </div>
        )}

        {activeTab === 'analyzer' && (
          <ResumeAnalyzerPanel
            selectedResume={selectedResume}
            setSelectedResume={setSelectedResume}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            isAnalyzing={isAnalyzing}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            analysisResult={analysisResult}
            onAnalyze={() => handleAnalyze()}
            analysisNotes={analysisNotes}
            setAnalysisNotes={setAnalysisNotes}
          />
        )}
        </Tabs>
      </div>
    </div>
  );
}
