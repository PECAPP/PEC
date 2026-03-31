'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 BookOpen, Plus, Edit, Trash2, Users, GraduationCap,
 Loader2, Download, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { createCourseAction, updateCourseAction, deleteCourseAction } from '../actions';

const emptyCourse = { name: '', code: '', department: '', credits: 4, instructorId: '' };

export function AcademicsView({ initialCourses, initialDepartments, isAdmin }: {
 initialCourses: any[];
 initialDepartments: any[];
 isAdmin: boolean;
}) {
 const router = useRouter();
 const [courses, setCourses] = useState(initialCourses);
 const [searchTerm, setSearchTerm] = useState('');
 const [deptFilter, setDeptFilter] = useState('all');
 const [showDialog, setShowDialog] = useState(false);
 const [editingCourse, setEditingCourse] = useState<any>(null);
 const [courseForm, setCourseForm] = useState<typeof emptyCourse>(emptyCourse);

 useEffect(() => setCourses(initialCourses), [initialCourses]);

 const { execute: executeCreate, isPending: isCreating } = useAction(createCourseAction, {
  onSuccess: () => { toast.success('Course Node initiated!'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Initiation failed.'),
 });

 const { execute: executeUpdate, isPending: isUpdating } = useAction(updateCourseAction, {
  onSuccess: () => { toast.success('Course updated.'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Update failed.'),
 });

 const { execute: executeDelete } = useAction(deleteCourseAction, {
  onSuccess: () => { toast.success('Course deleted.'); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Delete failed.'),
 });

 const openEditDialog = (c: any) => {
  setEditingCourse(c);
  setCourseForm({ name: c.name, code: c.code, department: c.department || '', credits: c.credits || 4, instructorId: c.instructorId || '' });
  setShowDialog(true);
 };

 const handleSubmit = () => {
  if (editingCourse) {
   executeUpdate({ ...courseForm, id: editingCourse.id });
  } else {
   executeCreate(courseForm);
  }
 };

 const filtered = courses.filter(c => {
  const q = searchTerm.toLowerCase();
  const matchSearch = !searchTerm || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
  const matchDept = deptFilter === 'all' || c.department === deptFilter;
  return matchSearch && matchDept;
 });

 const departments = [...new Set(courses.map((c: any) => c.department).filter(Boolean))];

 const exportCourses = async () => {
  const { utils, writeFile } = await import('xlsx');
  const ws = utils.json_to_sheet(courses.map(c => ({ code: c.code, name: c.name, department: c.department, credits: c.credits })));
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Courses');
  writeFile(wb, `courses_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast.success('Exported!');
 };

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
     <h1 className="text-3xl font-black uppercase tracking-tight">Academic Registry</h1>
     <p className="text-muted-foreground font-bold italic text-[11px] uppercase tracking-widest mt-1">Course Domain Architecture</p>
    </div>
    <div className="flex gap-3">
     <Button variant="outline" onClick={exportCourses} className="h-11 border-2 font-bold px-6 rounded-sm">
      <Download className="w-4 h-4 mr-2" /> Export
     </Button>
     {isAdmin && (
      <Button onClick={() => { setEditingCourse(null); setCourseForm(emptyCourse); setShowDialog(true); }} className="h-11 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-sm px-6">
       <Plus className="w-4 h-4 mr-2" /> Add Course Node
      </Button>
     )}
    </div>
   </div>

   {/* Stats */}
   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
    {[
     { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'primary' },
     { label: 'Domain Clusters', value: departments.length, icon: GraduationCap, color: 'success' },
     { label: 'Total Credits', value: courses.reduce((s: number, c: any) => s + (c.credits || 0), 0), icon: Users, color: 'warning' },
    ].map(({ label, value, icon: Icon, color }) => (
     <div key={label} className="card-elevated p-6 border-b-4 border-r-4 border-primary/10">
      <div className="flex items-center gap-4">
       <div className={`p-3 rounded-sm bg-${color}/10 border border-${color}/20`}><Icon className={`w-6 h-6 text-${color}`} /></div>
       <div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{label}</p>
        <p className="text-4xl font-black mt-1">{value}</p>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Filters */}
   <div className="flex flex-col md:flex-row gap-4">
    <Input placeholder="Search course registry..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 h-14 border-2 rounded-sm font-bold bg-background/50" />
    <Select value={deptFilter} onValueChange={setDeptFilter}>
     <SelectTrigger className="h-14 border-2 rounded-sm font-bold w-full md:w-56 bg-background/50">
      <SelectValue placeholder="All Domains" />
     </SelectTrigger>
     <SelectContent className="border-2 rounded-sm">
      <SelectItem value="all" className="font-bold">All Domains</SelectItem>
      {departments.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}
     </SelectContent>
    </Select>
   </div>

   {/* Course Grid */}
   <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <AnimatePresence>
     {filtered.length === 0 ? (
      <div className="col-span-full p-20 text-center text-muted-foreground font-bold italic">No course nodes found.</div>
     ) : filtered.map((course: any) => (
      <motion.div
       key={course.id}
       initial={{ opacity: 0, scale: 0.97 }}
       animate={{ opacity: 1, scale: 1 }}
       whileHover={{ y: -6 }}
       className="card-elevated p-8 border-2 rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.03)] group cursor-pointer border-l-4 border-l-primary"
       onClick={() => router.push(`/courses/${course.id}`)}
      >
       <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
         <Badge className="font-mono text-[10px] font-bold h-7 rounded-sm border-2 bg-primary/10 text-primary border-primary/20 px-3">
          {course.code}
         </Badge>
         <h3 className="font-black text-xl leading-tight uppercase tracking-tight">{course.name}</h3>
        </div>
        {isAdmin && (
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)} className="hover:bg-primary/10 rounded-sm h-8 w-8 p-0">
           <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Delete ${course.name}?`)) executeDelete({ id: course.id }); }} className="hover:bg-destructive/10 text-destructive rounded-sm h-8 w-8 p-0">
           <Trash2 className="w-4 h-4" />
          </Button>
         </div>
        )}
       </div>

       <div className="space-y-3 text-[10px] font-black uppercase tracking-widest">
        <div className="flex justify-between">
         <span className="text-muted-foreground/60">Domain</span>
         <span className="font-mono">{course.department || '—'}</span>
        </div>
        <div className="flex justify-between">
         <span className="text-muted-foreground/60">Credits</span>
         <span>{course.credits || '—'}</span>
        </div>
        {course.facultyName && (
         <div className="flex justify-between">
          <span className="text-muted-foreground/60">Instructor</span>
          <span className="truncate ml-4">{course.facultyName}</span>
         </div>
        )}
       </div>

       <div className="mt-8 pt-6 border-t-2 border-border flex items-center justify-between">
        <Badge variant="outline" className="rounded-sm border font-bold text-[9px] tracking-widest">
         {course.enrollmentCount || 0} Enrolled
        </Badge>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
       </div>
      </motion.div>
     ))}
    </AnimatePresence>
   </div>

   {/* Dialog */}
   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className="max-w-lg rounded-sm border-2 border-primary shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
     <DialogHeader className="space-y-3">
      <DialogTitle className="text-3xl font-black uppercase">{editingCourse ? 'Modify Course Node' : 'Initialize Course Node'}</DialogTitle>
      <DialogDescription className="text-[10px] font-black uppercase tracking-widest bg-muted p-2 rounded-sm">Academic Domain Registration</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Course Code *</label>
        <Input value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} className="h-12 border-2 rounded-sm font-mono font-bold" placeholder="CS101" />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits</label>
        <Input type="number" value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 4 })} className="h-12 border-2 rounded-sm font-bold" min={1} max={20} />
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Course Name *</label>
       <Input value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} className="h-12 border-2 rounded-sm font-black" placeholder="Introduction to Computing" />
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domain (Department)</label>
       {initialDepartments.length > 0 ? (
        <Select value={courseForm.department} onValueChange={v => setCourseForm({ ...courseForm, department: v })}>
         <SelectTrigger className="h-12 border-2 rounded-sm font-bold">
          <SelectValue placeholder="Select domain..." />
         </SelectTrigger>
         <SelectContent className="border-2 rounded-sm">
          {initialDepartments.map((d: any) => (
           <SelectItem key={d.id} value={d.name} className="font-bold">{d.code} — {d.name}</SelectItem>
          ))}
         </SelectContent>
        </Select>
       ) : (
        <Input value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })} className="h-12 border-2 rounded-sm font-bold" placeholder="e.g. Computer Science" />
       )}
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={handleSubmit} disabled={isCreating || isUpdating} className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-sm">
        {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {editingCourse ? 'Update Node' : 'Initialize Node'}
       </Button>
       <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border-2 font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Abort</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}

