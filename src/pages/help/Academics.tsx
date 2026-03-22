import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileSpreadsheet,
  CalendarDays,
  BookMarked
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpContent } from '@/components/help/HelpContent';

const articles = [
  { 
    icon: BookOpen, 
    title: 'Courses & Materials', 
    description: 'Accessing your enrolled courses, syllabus, and study resources', 
    readTime: '3 min',
    content: `All your academic resources in one place. Here's how to use the Courses module:

• **Enrolled Courses**: View all subjects you're currently registered for this semester.
• **Syllabus**: Each course page has a downloadable PDF of the curriculum and learning outcomes.
• **Materials**: Access lecture notes, presentations, and external links shared by your faculty.
• **Discussion**: Some courses feature a forum for peer-to-peer learning and instructor Q&A.

To access, simply click on the 'Courses' link in the sidebar.`
  },
  { 
    icon: Calendar, 
    title: 'Timetable Management', 
    description: 'How to view, customize and sync your class schedule', 
    readTime: '4 min',
    content: `Stay on top of your schedule with the interactive Timetable:

1. **Daily View**: See your class line-up for the current day.
2. **Weekly Overview**: Expand the view to see your entire week's commitments.
3. **Venue Mapping**: Click on any class to see the room number and building block.
4. **Rescheduling Alerts**: Receive instant notifications if a faculty member moves a lecture.

You can also sync your timetable with Google Calendar via the 'Export' button.`
  },
  { 
    icon: ClipboardCheck, 
    title: 'Attendance Tracking', 
    description: 'Understanding attendance calculation and reporting discrepancies', 
    readTime: '3 min',
    content: `PEC makes attendance transparent:

• **Live Stats**: Your attendance percentage is updated as soon as a faculty marks it in class.
• **Threshold Alerts**: Receive a warning if your attendance drops below the required 75%.
• **Detailed Logs**: See exactly which dates you were marked 'Absent' or 'Late'.
• **Discrepancies**: If you think there's a mistake, use the 'Raise Issue' button on the specific date's record to notify your teacher.

Faculty can mark attendance by scanning student IDs or via a manual checklist on their tablets.`
  },
  { 
    icon: GraduationCap, 
    title: 'Grades & Results', 
    description: 'How to view semester results and understand grading scales', 
    readTime: '2 min',
    content: `Your academic progress is visualized through the Grades module:

1. **Current Semester**: See marks for internal assessments and mid-terms as they are released.
2. **Final Results**: Once the semester ends, view your official Grade Point and letter grade.
3. **GPA Calculator**: The system automatically calculates your SGPA and CGPA based on credit weightage.
4. **Historical Data**: Access results from previous semesters through the academic year dropdown.`
  },
  { 
    icon: CalendarDays, 
    title: 'Examination Portal', 
    description: 'Viewing exam schedules, venues, and hall tickets', 
    readTime: '3 min',
    content: `Prepare for your exams with these portal features:

• **Schedule**: View the date, time, and duration for all mid-term and end-term exams.
• **Hall Ticket**: Download and print your exam permit once the administration releases it.
• **Venues**: Find your assigned seat number and room block to avoid last-minute confusion.
• **Guidelines**: Read the specific do's and don'ts for the examination hall provided by the controller of exams.`
  }
];

export default function AcademicsHelp() {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

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

      <AnimatePresence mode="wait">
        {selectedArticle === null ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedArticle(index)}
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
          </motion.div>
        ) : (
          <motion.div
            key="article"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedArticle(null)}
                  className="mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {(() => {
                        const Icon = articles[selectedArticle].icon;
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{articles[selectedArticle].title}</h2>
                      <p className="text-muted-foreground mt-1">{articles[selectedArticle].description}</p>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <HelpContent content={articles[selectedArticle].content} />
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <ClipboardCheck className="w-5 h-5" />
                        <span>Was this helpful?</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Yes</Button>
                        <Button variant="outline" size="sm">No</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
