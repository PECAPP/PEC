'use client';
import { Button, PageBanner } from "@pec/ui";

import { 
  FileText, 
  Eye, 
  Save, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Loader2 
} from "lucide-react";

import { cn } from "@/lib/utils";

interface ResumeHeaderProps {
  _settings: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  zoom: number;
  setZoom: (zoom: (z: number) => number) => void;
  preview: boolean;
  setPreview: (preview: boolean) => void;
  hasUnsavedResumeChanges: boolean;
  isSavingResume: boolean;
  handleSaveResume: () => void;
  downloadPDF: () => void;
}

export function ResumeHeader({
  _settings,
  activeTab,
  setActiveTab,
  zoom,
  setZoom,
  preview,
  setPreview,
  hasUnsavedResumeChanges,
  isSavingResume,
  handleSaveResume,
  downloadPDF,
}: ResumeHeaderProps) {
  return (
    <PageBanner
      title="Resume Builder"
      subtitle="Create, edit, and evaluate your professional resume against target placement profiles."
      icon={<FileText className="w-8 h-8 text-primary" />}
      badgeText="Placement Profile & Analysis"
      actions={
        <div className="flex flex-col xl:flex-row items-end xl:items-center gap-4">
          <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-md border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="h-8 w-8 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="h-8 w-8 p-0"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={preview ? "default" : "outline"}
              onClick={() => setPreview(!preview)}
              className="w-28 font-semibold shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {preview ? "Edit Mode" : "Preview"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveResume}
              disabled={isSavingResume || !hasUnsavedResumeChanges}
              className={cn(
                "w-28 font-semibold shadow-sm",
                hasUnsavedResumeChanges && !isSavingResume && "border-primary/50 text-primary"
              )}
            >
              {isSavingResume ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSavingResume ? "Saving..." : hasUnsavedResumeChanges ? "Save" : "Saved"}
            </Button>

            <Button
              variant="default"
              onClick={downloadPDF}
              className="shadow-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      }
    />
  );
}

