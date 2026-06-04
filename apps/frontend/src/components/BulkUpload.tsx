import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BulkUploadProps {
  entityType: 'users' | 'courses' | 'departments' | 'faculty' | 'fees' | 'timetable' | 'attendance' | 'grades' | 'exams' | 'assignments' | 'materials' | 'jobs';
  onImport: (data: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
  templateColumns: string[];
  sampleData?: any[];
}

export default function BulkUpload({ entityType, onImport, templateColumns, sampleData }: BulkUploadProps) {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndSetData(results.data);
        },
        error: (error) => {
          setValidationErrors([`CSV Parse Error: ${error.message}`]);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetData(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const validateAndSetData = (data: any[]) => {
    const errors: string[] = [];
    
    // Check if data is empty
    if (!data || data.length === 0) {
      errors.push('File is empty');
      setValidationErrors(errors);
      return;
    }

    // Check for required columns
    const firstRow = data[0];
    const missingColumns = templateColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      templateColumns.forEach(col => {
        if (!row[col] || row[col].toString().trim() === '') {
          errors.push(`Row ${index + 2}: Missing value for "${col}"`);
        }
      });
    });

    setValidationErrors(errors);
    setUploadedData(data);
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      return;
    }

    setImporting(true);
    try {
      const result = await onImport(uploadedData);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        failed: uploadedData.length,
        errors: [(error as Error).message]
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = sampleData || [
      templateColumns.reduce((obj, col) => ({ ...obj, [col]: 'Sample' }), {})
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, entityType);
    XLSX.writeFile(workbook, `${entityType}_template.xlsx`);
  };

  const resetUpload = () => {
    setUploadedData([]);
    setValidationErrors([]);
    setShowPreview(false);
    setImportResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Download Template Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={downloadTemplate} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the file here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">Drag & drop CSV or Excel file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </>
        )}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          Supports .csv, .xlsx, .xls
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Import Data</DialogTitle>
            <DialogDescription>
              Review the data before importing. {uploadedData.length} records found.
            </DialogDescription>
          </DialogHeader>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-destructive">Validation Errors ({validationErrors.length})</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm max-h-40 overflow-y-auto">
                {validationErrors.slice(0, 10).map((error, idx) => (
                  <li key={idx} className="text-destructive">{error}</li>
                ))}
                {validationErrors.length > 10 && (
                  <li className="text-muted-foreground">... and {validationErrors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`border rounded-lg p-4 ${importResult.failed > 0 ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
              <div className="flex items-center gap-2 mb-2">
                {importResult.failed > 0 ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                <h4 className="font-semibold">Import Results</h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-success">✓ {importResult.success} records imported successfully</p>
                <p className="text-destructive">✗ {importResult.failed} records failed</p>
              </div>
              {importResult.errors.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, idx) => (
                    <li key={idx} className="text-destructive">{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Data Preview Table */}
          {!importResult && (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b sticky top-0">
                    <tr>
                      {templateColumns.map((col) => (
                        <th key={col} className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {uploadedData.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        {templateColumns.map((col) => (
                          <td key={col} className="p-3 whitespace-nowrap">
                            {row[col] || <span className="text-muted-foreground italic">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {uploadedData.length > 50 && (
                <div className="p-3 bg-muted/20 text-center text-sm text-muted-foreground">
                  Showing first 50 of {uploadedData.length} records
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {!importResult ? (
              <>
                <Button
                  onClick={handleImport}
                  disabled={validationErrors.length > 0 || importing}
                  className="flex-1"
                >
                  {importing ? 'Importing...' : `Import ${uploadedData.length} Records`}
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => { resetUpload(); setShowPreview(false); }} className="flex-1">
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
