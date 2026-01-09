import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  BarChart,
  Download,
  Clock,
  Award,
  Target,
  Layers,
  ListChecks,
  FileSpreadsheet,
  CalendarDays,
  BookMarked
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const articles = [
  { icon: BookOpen, title: 'Viewing Your Courses', description: 'Access your enrolled courses and course materials', readTime: '3 min' },
  { icon: Calendar, title: 'Understanding Your Timetable', description: 'Navigate and customize your class schedule', readTime: '4 min' },
  { icon: ClipboardCheck, title: 'Checking Attendance Records', description: 'View your attendance percentage and history', readTime: '3 min' },
  { icon: GraduationCap, title: 'Viewing Exam Results', description: 'Access your grades and examination scores', readTime: '2 min' },
  { icon: BarChart, title: 'Academic Performance Analytics', description: 'Understand your performance trends and insights', readTime: '5 min' },
  { icon: Download, title: 'Downloading Transcripts', description: 'Get official and unofficial transcripts', readTime: '3 min' },
  { icon: Award, title: 'Viewing Certificates', description: 'Access and download your certificates', readTime: '2 min' },
  { icon: Target, title: 'Setting Academic Goals', description: 'Track and manage your academic objectives', readTime: '4 min' },
  { icon: Layers, title: 'Enrolling in Electives', description: 'How to choose and enroll in elective courses', readTime: '4 min' },
  { icon: ListChecks, title: 'Assignment Submissions', description: 'Submit assignments and track deadlines', readTime: '3 min' },
  { icon: FileSpreadsheet, title: 'Viewing Syllabus', description: 'Access course syllabus and learning outcomes', readTime: '2 min' },
  { icon: CalendarDays, title: 'Exam Schedule', description: 'View upcoming examination dates and venues', readTime: '2 min' },
  { icon: BookMarked, title: 'Course Materials & Resources', description: 'Access study materials shared by faculty', readTime: '3 min' },
  { icon: Clock, title: 'Backlog Management', description: 'Understanding and clearing backlog courses', readTime: '4 min' },
  { icon: GraduationCap, title: 'Graduation Requirements', description: 'Track credits and requirements for graduation', readTime: '5 min' },
];

export default function AcademicsHelp() {
  return (
    <div className="space-y-6">
      <div>
        <Link to="/help">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Academics</h1>
            <p className="text-muted-foreground">{articles.length} articles about academic features</p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-3">
        {articles.map((article, index) => (
          <motion.div
            key={article.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/50">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <article.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{article.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
