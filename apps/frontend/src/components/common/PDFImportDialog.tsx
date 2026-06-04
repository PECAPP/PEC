import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Papa from 'papaparse';

interface PDFImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  onImport: (data: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
  templateColumns: string[];
  sampleData?: any[];
}

export default function PDFImportDialog({
  open,
  onOpenChange,
  entityType,
  onImport,
  templateColumns,
  sampleData = []
}: PDFImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          console.error('CSV Parse Errors:', results.errors);
          return;
        }

        // Validate columns
        const fileColumns = Object.keys(results.data[0] || {});
        const missingColumns = templateColumns.filter(col => !fileColumns.includes(col));
        
        if (missingColumns.length > 0) {
          toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        setParsedData(results.data as any[]);
        toast.success(`Parsed ${results.data.length} rows successfully`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error('Parse Error:', error);
      }
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setImporting(true);
    try {
      const result = await onImport(parsedData);
      setImportResult(result);
      
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} ${entityType}(s)`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} ${entityType}(s)`);
      }
    } catch (error) {
      toast.error('Import failed');
      console.error('Import Error:', error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse({
      fields: templateColumns,
      data: sampleData.length > 0 ? sampleData : [templateColumns.reduce((obj, col) => ({ ...obj, [col]: '' }), {})]
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_import_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {entityType}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {entityType}. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex justify-between items-center p-4 border border-border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Download Template</p>
                <p className="text-xs text-muted-foreground">
                  Required columns: {templateColumns.join(', ')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">or</p>
                <label>
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background border border-border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parsedData.length} rows parsed
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    disabled={importing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {parsedData.length > 0 && (
                  <div className="text-left p-3 bg-success/10 border border-success/20 rounded">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-success">
                          File validated successfully
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ready to import {parsedData.length} {entityType}(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-2">
              {importResult.success > 0 && (
                <div className="p-3 bg-success/10 border border-success/20 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <p className="text-sm font-medium text-success">
                      Successfully imported {importResult.success} {entityType}(s)
                    </p>
                  </div>
                </div>
              )}
              
              {importResult.failed > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive mb-2">
                        Failed to import {importResult.failed} {entityType}(s)
                      </p>
                      {importResult.errors.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 5).map((error, idx) => (
                            <p key={idx}>• {error}</p>
                          ))}
                          {importResult.errors.length > 5 && (
                            <p>... and {importResult.errors.length - 5} more errors</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || parsedData.length === 0 || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedData.length} ${entityType}(s)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
