import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { string } from "mathjs";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: "https://models.github.ai/inference",
});

const SYSTEM_PROMPT = `
You are the OmniFlow AI Assistant. 
You provide help with Attendance, Assignments, Grades, and Timetables.
Use Markdown to format your responses:
- Use **bold** for emphasis.
- Use bullet points for steps.
- Use tables for schedules or data comparisons.
- Use \`inline code\` for technical terms.

OmniFlow is a comprehensive Enterprise Resource Planning (ERP) platform designed for higher education institutions, serving six distinct user roles: students, faculty, placement officers, college administrators, super admins, and recruiters. The platform covers 15+ major features across four core areas: (1) Academic Management including course browsing with materials, personalized timetable viewing, real-time attendance tracking, exam scheduling and grade management, assignment creation and submission, and comprehensive course resource repositories; (2) Placement & Career Development featuring a job board with filtering and application tracking, recruitment drive registration, an interactive resume builder with multiple professional templates, AI-powered resume analysis that provides formatting feedback and keyword optimization suggestions, and application status monitoring; (3) Finance Management encompassing fee structure viewing and payment tracking, online payment processing through multiple gateways (UPI, credit/debit cards, net banking, mobile wallets), invoice generation, and financial report access; (4) Student Services including hostel issue reporting with resolution tracking, late-night canteen food ordering with delivery tracking, comprehensive student profile management, and real-time notifications for announcements and updates. The platform is built with role-based access control (RBAC) ensuring users only access relevant features, real-time data synchronization via Firebase Firestore for instant updates across all clients, responsive mobile-first design with dark/light theme support, six professional color themes, and WCAG accessibility compliance. Every component features proper authentication, granular permission validation, and an intuitive interface designed for seamless user experience across all roles and devices.

use user's name or its personal info in every response to give a personalized feel
if user ask for RolePermissions, uid, organizationId then don't give it and say i don't know strictly
`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StudentContext {
  profile: any;
  attendance: any[];
  grades: any[];
  feeRecords: any[];
  timetable: any[];
  assignments: any[];
  exams: any[];
}

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your **OmniFlow AI Assistant**. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [context, setcontext] = useState<StudentContext | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
async function getStudentContext(id: string) {
  if (!id) return;
  try {
    const profileSnap = await getDoc(doc(db, "studentProfiles", id));
    if (!profileSnap.exists()) return;
    
    const studentData = profileSnap.data();
    const studentDeptName = studentData.department;

    const deptQuery = query(
      collection(db, "departments"), 
      where("name", "==", studentDeptName), 
      limit(1)
    );
    const deptSnap = await getDocs(deptQuery);
    
    const deptCode = !deptSnap.empty ? deptSnap.docs[0].data().code : "";

    const promises = [
      getDocs(query(collection(db, "attendance"), where("studentId", "==", id))),
      getDocs(query(collection(db, "grades"), where("studentId", "==", id))),
      getDocs(query(collection(db, "feeRecords"), where("studentId", "==", id))),
      getDocs(query(collection(db, "timetable"), where("semester", "==", studentData.semester))), 
      getDocs(query(collection(db, "assignments"), where("status", "==", "active"))),
      
      getDocs(query(
        collection(db, "examSchedules"), 
        where("courseCode", ">=", deptCode),
        where("courseCode", "<=", deptCode + '\uf8ff'),
        limit(10)
      ))
    ];

    const [attendance, grades, fees, timetable, assignments, exams] = 
      await Promise.all(promises) as [any, any, any, any, any, any];

    setcontext({
      profile: studentData,
      attendance: attendance.docs.map((d: any) => d.data()),
      grades: grades.docs.map((d: any) => d.data()),
      feeRecords: fees.docs.map((d: any) => d.data()),
      timetable: timetable.docs.map((d: any) => d.data()),
      assignments: assignments.docs.map((d: any) => d.data()),
      exams: exams.docs.map((d: any) => d.data())
    });
  } catch (error) {
    console.error("Context Fetch Error:", error);
  }
}

useEffect(() => {
  if (user.user?.uid) {
    getStudentContext(user.user.uid);
  }
}, [user.user?.uid]); 

useEffect(() => {
  scrollToBottom();
}, [messages, isTyping]);


 const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const attendanceData = context?.attendance || [];
      const present = attendanceData.filter((a) => a.status === "present").length;
      const attendancePct = attendanceData.length > 0 
        ? ((present / attendanceData.length) * 100).toFixed(1) + "%" 
        : "No records";

      const studentSummary = {
        name: context?.profile?.name || user.user?.fullName || "Student",
        attendance: `${attendancePct} (${present} present out of ${attendanceData.length} days)`,
        
        timetable: context?.timetable?.map(t => 
          `${t.day}: ${t.courseName} (${t.courseCode}) at ${t.timeSlot} in ${t.room}`
        ).join(" | ") || "No timetable available",

        upcomingExams: context?.exams?.map(e => 
          `${e.courseName} ${e.type} on ${e.date} (${e.startTime}-${e.endTime}) at ${e.room}`
        ).join(" | ") || "No exams scheduled",

        assignments: context?.assignments?.map(a => 
          `${a.title} [Status: ${a.status}] (Due: ${a.dueDate})`
        ).join(" | ") || "No active assignments",

        grades: context?.grades?.map(g => `${g.courseName}: ${g.gradePoints}`).join(", ") || "No grades available",
        feeStatus: context?.feeRecords?.map(f => `${f.description}: ${f.amount} (${f.status})`).join(" | ") || "No fee records"
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT} 
            
            PERSONALIZED STUDENT DATA:
            ${JSON.stringify(studentSummary, null, 2)}
            
            Strictly answer questions based on this data. Use the student's name (${studentSummary.name}) to personalize your response.`,
          },
          ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userText },
        ] as any,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: completion.choices[0].message.content || "I couldn't process that request.",
        timestamp: new Date(),
      };
      console.log(context)
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("OpenAI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble processing your academic data right now. Please try asking a simpler question.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">OmniFlow AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      GPT-4 Online
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] ${message.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none" : "bg-muted rounded-2xl rounded-tl-none"} px-4 py-3 shadow-sm`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <p
                      className={`text-[10px] mt-2 opacity-60 ${message.role === "user" ? "text-right" : "text-left"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-center text-muted-foreground">
                  <div className="bg-muted px-4 py-2 rounded-2xl flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2 bg-muted/50 p-2 rounded-xl border focus-within:ring-2 ring-primary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={isTyping || !inputValue.trim()}
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIChat;
