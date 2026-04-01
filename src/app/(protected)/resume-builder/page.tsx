'use client';

import { motion } from "framer-motion";
import { LoadingGrid } from "@/components/common/AsyncState";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";

// Modular Components
import { ResumeHeader } from "./components/ResumeHeader";
import { ResumeEditor } from "./components/ResumeEditor";
import { ResumePreview } from "./components/ResumePreview";
import dynamic from "next/dynamic";

const ResumeAnalyzerPanel = dynamic(
  () => import("./components/ResumeAnalyzerPanel").then((mod) => mod.ResumeAnalyzerPanel),
  {
    ssr: false,
    loading: () => <div className="card-elevated ui-card-pad min-h-[320px] animate-pulse" />,
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
  } = useResumeBuilder();

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" itemClassName="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 space-y-6">
      <ResumeHeader
        settings={settings}
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

      <div className="w-full mx-auto px-4 lg:px-8 py-6">
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
          />
        )}
      </div>
    </div>
  );
}
