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
    <div className="bg-card border-b-2 border-primary/20 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-sm">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Resume builder</h1>
            </div>
          </div>

          <div className="flex bg-muted/30 p-1 rounded-sm border-2 border-border shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setActiveTab("builder")}
              className={cn(
                "px-6 h-10 rounded-sm text-xs font-semibold transition-all",
                activeTab === "builder"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
              )}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className={cn(
                "px-6 h-10 rounded-sm text-xs font-semibold transition-all",
                activeTab === "analyzer"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
              )}
            >
              AI Analyzer
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "builder" && (
              <>
                <div className="flex items-center gap-1 bg-muted/30 rounded-sm border-2 border-border p-1 h-11">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-[10px] font-bold w-12 text-center font-mono">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  className="h-11 border font-semibold px-4 rounded-sm text-xs"
                  onClick={() => setPreview(!preview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {preview ? "Edit Mode" : "Preview Mode"}
                </Button>

                <Button
                  variant="outline"
                  className="h-11 border font-semibold px-4 rounded-sm text-xs"
                  disabled={!hasUnsavedResumeChanges || isSavingResume}
                  onClick={handleSaveResume}
                >
                  {isSavingResume ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className={cn("w-4 h-4 mr-2", hasUnsavedResumeChanges && "text-primary")} />
                      {hasUnsavedResumeChanges ? "Save Changes" : "Saved"}
                    </>
                  )}
                </Button>

                <Button className="h-11 bg-primary text-primary-foreground font-bold text-xs rounded-sm px-6 shadow-md hover:translate-y-[-1px] transition-all" onClick={downloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
