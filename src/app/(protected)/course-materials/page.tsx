'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Loader2,
  BookOpen,
  Video,
  File,
  ClipboardList,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
;
import { usePermissions } from '@/hooks/usePermissions';
import BulkUpload from '@/components/BulkUpload';
import { fetchAllPages } from '@/lib/fetchAllPages';

import { api } from '@/lib/api';

interface CourseMaterial {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  description: string;
  fileURL: string;
  type: 'lecture-notes' | 'reference' | 'assignment' | 'video' | 'other';
  uploadedBy: string;
  uploadedAt: any;
}

const formatUploadedDate = (uploadedAt: unknown) => {
  if (!uploadedAt) return 'N/A';
  if (typeof uploadedAt === 'object' && uploadedAt !== null && 'toDate' in uploadedAt) {
    const timestampObj = uploadedAt as { toDate?: () => Date };
    const converted = timestampObj.toDate?.();
    return converted ? converted.toLocaleDateString() : 'N/A';
  }
  const parsed = new Date(uploadedAt as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
};

export default function CourseMaterials() {
  const router = useRouter();
  const { isAdmin, isFaculty, isStudent, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      router.replace('/auth');
      return;
    }
    setLoading(false);
  }, [authLoading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return <MaterialsManager userId={user.uid} userRole={user.role} />;
  }

  return <StudentMaterialsView userId={user.uid} />;
}

function MaterialsManager({ userId, userRole }: { userId: string; userRole: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materialsApiAvailable, setMaterialsApiAvailable] = useState(true);
  const hasWarnedMissingMaterialsApi = useRef(false);

  const [materialForm, setMaterialForm] = useState({
    courseId: '',
    title: '',
    description: '',
    fileURL: '',
    type: 'lecture-notes' as CourseMaterial['type'],
  });

  const isAdmin = userRole.includes('admin');

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchMaterials();
    }
  }, [courses, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const allCourses = await fetchAllPages<any>('/courses');
      const scopedCourses = isAdmin
        ? allCourses
        : allCourses.filter((course: any) => course.instructor === userId || course.facultyId === userId);
      setCourses(scopedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const courseIds = selectedCourse ? [selectedCourse] : courses.map(c => c.id);
      if (courseIds.length === 0) return;

      const materialsData = (await fetchAllPages<CourseMaterial>('/course-materials'))
        .filter((m: CourseMaterial) => courseIds.includes(m.courseId));
      
      setMaterials(materialsData);
      setMaterialsApiAvailable(true);
    } catch (error) {
      if (error?.response?.status === 404) {
        setMaterialsApiAvailable(false);
        setMaterials([]);
        if (!hasWarnedMissingMaterialsApi.current) {
          toast.info('Course materials API is not available yet.');
          hasWarnedMissingMaterialsApi.current = true;
        }
        return;
      }
      console.error('Error fetching materials:', error);
    }
  };

  const handleUpload = async () => {
    if (!materialForm.title || !materialForm.courseId || !materialForm.fileURL) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const course = courses.find(c => c.id === materialForm.courseId);
      await api.post('/course-materials', {
        ...materialForm,
        courseName: course?.name,
        courseCode: course?.code,
        uploadedBy: userId,
      });
      
      toast.success('Material uploaded successfully');
      setShowUploadDialog(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    
    try {
      await api.delete(`/course-materials/${id}`);
      toast.success('Material deleted');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const course = courses.find(c => c.code === row.courseCode);
        if (!course) throw new Error(`Course ${row.courseCode} not found`);

        await api.post('/course-materials', {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          title: row.title,
          description: row.description || '',
          fileURL: row.fileURL,
          type: row.type || 'other',
          uploadedBy: userId,
        });
        success++;
      } catch (err) {
        failed++;
        errors.push((err as Error).message);
      }
    }
    
    fetchMaterials();
    return { success, failed, errors };
  };

  const resetForm = () => {
    setMaterialForm({
      courseId: '',
      title: '',
      description: '',
      fileURL: '',
      type: 'lecture-notes',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture-notes': return <BookOpen className="w-6 h-6" />;
      case 'reference': return <FileText className="w-6 h-6" />;
      case 'assignment': return <ClipboardList className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const filteredMaterials = selectedCourse && selectedCourse !== 'all'
    ? materials.filter(m => m.courseId === selectedCourse)
    : materials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Materials</h1>
          <p className="text-muted-foreground">Upload and manage course materials</p>
        </div>
        <div className="button-group">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setShowUploadDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Upload Material
          </Button>
        </div>
      </div>

      <div className="card-elevated p-4">
        <Select value={selectedCourse || 'all'} onValueChange={(val) => setSelectedCourse(val === 'all' ? '' : val)}>
          <SelectTrigger>
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {!materialsApiAvailable && (
          <div className="card-elevated p-4 text-sm text-muted-foreground">
            Course materials backend is not configured yet.
          </div>
        )}
        {filteredMaterials.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No materials uploaded yet</p>
          </div>
        ) : (
          filteredMaterials.map((material, idx) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card-elevated p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getTypeIcon(material.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{material.title}</h3>
                      <Badge variant="outline">{material.courseCode}</Badge>
                      <Badge variant="secondary">{material.type.replace('-', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {formatUploadedDate(material.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(material.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Course Material</DialogTitle>
            <DialogDescription>Add a new material for your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course</label>
              <Select value={materialForm.courseId} onValueChange={val => setMaterialForm({...materialForm, courseId: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="mt-1" placeholder="Lecture 1 - Introduction" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={materialForm.description} onChange={e => setMaterialForm({...materialForm, description: e.target.value})} className="mt-1 w-full min-h-[80px] p-2 rounded border bg-background" placeholder="Brief description..." />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={materialForm.type} onValueChange={(val: any) => setMaterialForm({...materialForm, type: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture-notes">Lecture Notes</SelectItem>
                  <SelectItem value="reference">Reference Material</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">File URL</label>
              <Input value={materialForm.fileURL} onChange={e => setMaterialForm({...materialForm, fileURL: e.target.value})} className="mt-1" placeholder="https://drive.google.com/..." />
              <p className="text-xs text-muted-foreground mt-1">Upload to Google Drive/Dropbox and paste shareable link</p>
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Material</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Materials</DialogTitle>
            <DialogDescription>Columns: courseCode, title, description, type, fileURL</DialogDescription>
          </DialogHeader>
          <BulkUpload 
            entityType="materials" 
            onImport={handleBulkImport} 
            templateColumns={['courseCode', 'title', 'description', 'type', 'fileURL']}
            sampleData={[{ courseCode: 'CS101', title: 'Lecture 1', description: 'Intro', type: 'lecture-notes', fileURL: 'https://...' }]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentMaterialsView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [materialsApiAvailable, setMaterialsApiAvailable] = useState(true);
  const hasWarnedMissingMaterialsApi = useRef(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      let enrollmentsResponse;
      try {
        const scopedEnrollments = await fetchAllPages<any>('/enrollments', {
          studentId: userId,
          status: 'active',
        });
        enrollmentsResponse = { data: scopedEnrollments };
      } catch {
        const allEnrollments = await fetchAllPages<any>('/enrollments');
        enrollmentsResponse = { data: allEnrollments };
      }
      const enrolledCourseIds = (Array.isArray(enrollmentsResponse.data) ? enrollmentsResponse.data : [])
        .filter((enrollment: any) => enrollment.studentId === userId && (enrollment.status ?? 'active') === 'active')
        .map((enrollment: any) => enrollment.courseId);

      if (enrolledCourseIds.length === 0) {
        setLoading(false);
        return;
      }

      const coursesData = (await fetchAllPages<any>('/courses'))
        .filter((course: any) => enrolledCourseIds.includes(course.id));
      setCourses(coursesData);

      try {
        const materialsData = (await fetchAllPages<CourseMaterial>('/course-materials'))
          .filter((m: CourseMaterial) => enrolledCourseIds.includes(m.courseId));
        
        setMaterials(materialsData);
        setMaterialsApiAvailable(true);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setMaterials([]);
          setMaterialsApiAvailable(false);
          if (!hasWarnedMissingMaterialsApi.current) {
            toast.info('Course materials API is not available yet.');
            hasWarnedMissingMaterialsApi.current = true;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture-notes': return <BookOpen className="w-6 h-6" />;
      case 'reference': return <FileText className="w-6 h-6" />;
      case 'assignment': return <ClipboardList className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesCourse = filterCourse === 'all' || m.courseId === filterCourse;
    return matchesType && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Course Materials</h1>
        <p className="text-muted-foreground">Access learning resources for your courses</p>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lecture-notes">Lecture Notes</SelectItem>
              <SelectItem value="reference">References</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {!materialsApiAvailable && (
          <div className="card-elevated p-4 text-sm text-muted-foreground">
            Course materials backend is not configured yet.
          </div>
        )}
        {filteredMaterials.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No materials available</p>
          </div>
        ) : (
          filteredMaterials.map((material, idx) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card-elevated p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {getTypeIcon(material.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold">{material.title}</h3>
                      <Badge variant="outline">{material.courseCode}</Badge>
                      <Badge variant="secondary">{material.type.replace('-', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{material.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {formatUploadedDate(material.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Button size="sm" asChild className="flex-shrink-0 w-full md:w-auto">
                  <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
