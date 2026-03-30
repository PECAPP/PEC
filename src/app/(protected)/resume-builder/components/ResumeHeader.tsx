'use client';

import { 
  FileText, 
  Eye, 
  Save, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeHeaderProps {
  settings: any;
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
  settings,
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
    <div className="bg-card/95 border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Resume Hub</h1>
              <p className="text-xs text-muted-foreground">
                {settings?.collegeName || "Career Center"}
              </p>
            </div>
          </div>

          <div className="flex bg-secondary/70 p-1 rounded-md border border-border">
            <button
              onClick={() => setActiveTab("builder")}
              className={cn(
                "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                activeTab === "builder"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className={cn(
                "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                activeTab === "analyzer"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
            >
              AI Analyzer
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "builder" && (
              <>
                <div className="flex items-center gap-1 mr-2 bg-secondary rounded-md p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-xs w-9 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPreview(!preview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {preview ? "Edit" : "Preview"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  disabled={!hasUnsavedResumeChanges || isSavingResume}
                  onClick={handleSaveResume}
                >
                  {isSavingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {hasUnsavedResumeChanges ? "Save Changes" : "Saved"}
                    </>
                  )}
                </Button>
                <Button size="sm" className="h-9" onClick={downloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
