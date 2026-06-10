'use client';
import { Button } from "@pec/ui";

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
    <div className="bg-card border-b-2 border-primary/20 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md">
      <div className="  px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-sm">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Resume builder</h1>
            </div>
          </div>

          <div className="flex bg-muted/30 p-1 rounded-sm border border-border shadow-sm">
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

          <div className="flex items-center gap-2">
            {activeTab === "builder" && (
              <div className="flex items-center bg-muted/20 p-1.5 rounded-sm border border-border/50 shadow-sm gap-1">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border-r border-border/50 pr-2 mr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 rounded-sm"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-[10px] font-bold w-10 text-center font-mono text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 rounded-sm"
                    onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Mode Toggle */}
                <Button
                  variant={preview ? "secondary" : "ghost"}
                  className={cn("h-8 px-3 rounded-sm text-xs font-semibold", preview && "bg-primary/10 text-primary")}
                  onClick={() => setPreview(!preview)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  {preview ? "Edit Mode" : "Preview"}
                </Button>

                {/* Save Button */}
                <Button
                  variant="ghost"
                  className={cn("h-8 px-3 rounded-sm text-xs font-semibold", hasUnsavedResumeChanges && "text-primary bg-primary/5")}
                  disabled={!hasUnsavedResumeChanges || isSavingResume}
                  onClick={handleSaveResume}
                >
                  {isSavingResume ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className={cn("w-3.5 h-3.5 mr-1.5", hasUnsavedResumeChanges && "text-primary")} />
                      {hasUnsavedResumeChanges ? "Save" : "Saved"}
                    </>
                  )}
                </Button>

                {/* Export Button */}
                <Button 
                  className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm px-4 ml-1 shadow-sm transition-all" 
                  onClick={downloadPDF}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

