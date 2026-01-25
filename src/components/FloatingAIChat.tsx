import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL:"https://models.github.ai/inference"
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
`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your **OmniFlow AI Assistant**. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userText }
        ] as any,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: completion.choices[0].message.content || "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
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
            // Increased size: Width from 360px to 440px, Height from 500px to 650px
            // Mobile: bottom-20 to clear nav
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">OmniFlow AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">GPT-4 Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none' : 'bg-muted rounded-2xl rounded-tl-none'} px-4 py-3 shadow-sm`}>
                    {/* Markdown Renderer */}
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <p className={`text-[10px] mt-2 opacity-60 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2 bg-muted/50 p-2 rounded-xl border focus-within:ring-2 ring-primary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
                  rows={1}
                />
                <Button onClick={handleSend} disabled={isTyping || !inputValue.trim()} size="icon" className="h-9 w-9 rounded-lg">
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