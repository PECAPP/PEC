"use client";
import { Button } from "@pec/ui";


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X, Minimize2, Mic, Volume2, VolumeX } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import api, {  isAuthError  } from "@pec/api";
import {  buildApiUrl  } from "@pec/api";
import {  authClient  } from "@pec/api";
import { GradesTable, AttendanceTable, ScheduleTable, SuggestionChips } from "./GenerativeUI";
import { useRouter } from "next/navigation";

const SYSTEM_PROMPT = `
You are the PEC AI Assistant — an intelligent campus agent for PEC University.
Always address the user by name when available. Be concise, helpful, and action-oriented.
You have access to real backend tools that fetch live data. NEVER fabricate or invent data.

TOOLS AND BEHAVIOR:

1. GRADES — call tool get_user_grades. The data will be shown automatically in a table.
   After the tool runs, write a short 1-2 sentence summary (CGPA, best/worst subject). Do NOT list or repeat raw data.

2. ATTENDANCE — call tool get_user_attendance. The report will be shown automatically in a table.
   After the tool runs, write a short 1-2 sentence summary (overall %, any courses at risk). Do NOT list or repeat raw data.

3. SCHEDULE/TIMETABLE — call tool get_user_schedule. The timetable will be shown automatically.
   After the tool runs, mention how many classes they have today. Do NOT list or repeat raw data.

4. NAVIGATION — when user asks to go to, visit, open, or be taken to any page:
   ALWAYS call the navigate_to_page tool. Do NOT write the path as text.
   Valid pages: Marketplace, Attendance, Grades, Timetable, Noticeboard, Canteen, Finance, Profile, Clubs, Hostel, Dashboard.
   After the tool runs, write a short friendly confirmation (e.g. "Taking you to the Marketplace now! 🛒").

5. QUICK REPLIES — always end with 2-3 options:
<UI:SuggestionChip>["option 1", "option 2", "option 3"]</UI>

Rules:
- Do NOT emit <UI:GradesTable>, <UI:AttendanceTable>, or <UI:ScheduleTable> tags — the system handles that automatically.
- Do NOT invent any data. If a tool fails or returns empty, tell the user clearly.
- Keep responses concise and helpful.
`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const TypewriterText = ({ text, onType }: { text: string; onType?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (text.length < indexRef.current) {
      indexRef.current = 0;
      setDisplayedText("");
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayedText(text.slice(0, indexRef.current));
        onType?.();
      } else {
        clearInterval(interval);
      }
    }, 6);

    return () => clearInterval(interval);
  }, [text, onType]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>;
};

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const cleanupResizeListeners = useRef<(() => void) | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (cleanupResizeListeners.current) {
        cleanupResizeListeners.current();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(600);

  const minWidth = 320;
  const minHeight = 400;

  useEffect(() => {
    const handleScreenResize = () => {
      const maxW = window.innerWidth - 32;
      const maxH = window.innerHeight - 100;
      setWidth(prev => Math.min(prev, maxW));
      setHeight(prev => Math.min(prev, maxH));
    };
    handleScreenResize();
    window.addEventListener("resize", handleScreenResize);
    return () => window.removeEventListener("resize", handleScreenResize);
  }, []);

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    direction: "n" | "w" | "nw"
  ) => {
    e.preventDefault();
    const startWidth = width;
    const startHeight = height;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      const maxW = window.innerWidth - 32;
      const maxH = window.innerHeight - 100;

      if (direction === "w" || direction === "nw") {
        const newWidth = Math.max(minWidth, Math.min(maxW, startWidth - deltaX));
        setWidth(newWidth);
      }
      if (direction === "n" || direction === "nw") {
        const newHeight = Math.max(minHeight, Math.min(maxH, startHeight - deltaY));
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
      cleanupResizeListeners.current = null;
    };

    cleanupResizeListeners.current = handleMouseUp;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: true });
    document.addEventListener("touchend", handleMouseUp);
  };

  useEffect(() => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hello! I'm your **PEC AI Assistant**. How can I help you today?\n<UI:SuggestionChip>[\"Show me my grades\", \"What is my attendance?\", \"Take me to the marketplace\"]</UI>",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Clean up UI tags and markdown
    const cleanText = text
      .replace(/<UI:.*?>[\s\S]*?<\/UI>/g, '')
      .replace(/[\*\#\_]/g, '')
      .trim();

    if (!cleanText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = async () => {
    setMicError(null);

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMicError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    // Explicitly request mic permission first so we can show a proper error
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError("Microphone access denied. Please allow mic permission in your browser and try again.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;  // Show partial results as you speak
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (interim) setInterimText(interim);
      if (final) {
        setInterimText("");
        setInputValue((prev) => (prev ? prev + " " : "") + final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setInterimText("");
      recognitionRef.current = null;
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setMicError("Microphone access was blocked. Check browser permissions and reload.");
      } else if (event.error === 'no-speech') {
        setMicError("No speech detected. Tap the mic and speak clearly.");
      } else if (event.error === 'network') {
        setMicError("Network error during voice recognition. Check your connection.");
      } else {
        setMicError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setMicError(`Could not start voice input: ${err?.message ?? "unknown error"}.`);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    if (authLoading) return;
    // Allow cookie-based sessions even if the client-side token is not present.
    // The server AuthGuard will validate credentials via Authorization header or cookies.

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const requestBody = {
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage.content },
        ],
      };

      const aiResponseId = (Date.now() + 1).toString();
      const fullUrl = buildApiUrl('/ai/completion');
      const token = authClient.getAccessToken();

      const fetchRes = await fetch(fullUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestBody)
      });

      if (!fetchRes.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = fetchRes.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No readable stream');

      let done = false;
      let fullText = "";
      let hasCreatedMessage = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                
                const ensureMessageExists = (initialContent: string = "") => {
                  if (!hasCreatedMessage) {
                    hasCreatedMessage = true;
                    setIsTyping(false); // Hide thinking dots when content starts showing
                    setMessages(prev => [
                      ...prev,
                      {
                        id: aiResponseId,
                        role: "assistant",
                        content: initialContent,
                        timestamp: new Date(),
                      }
                    ]);
                  }
                };

                if (data.tool) {
                  let thinkingText = "⚙️ Working...";
                  if (data.tool === "get_user_grades") thinkingText = "📊 Fetching your academic transcript...";
                  else if (data.tool === "get_user_attendance") thinkingText = "📅 Calculating your attendance & predictions...";
                  else if (data.tool === "get_user_schedule") thinkingText = "🗓️ Loading your weekly timetable...";
                  else if (data.tool === "navigate_to_page") thinkingText = "🚦 Navigating...";
                  else if (data.tool === "search_marketplace") thinkingText = "🛍️ Searching the marketplace...";
                  else if (data.tool === "get_upcoming_events") thinkingText = "🎉 Finding upcoming college events...";
                  else if (data.tool === "search_college_notices") thinkingText = "🔍 Scanning college notices...";
                  
                  ensureMessageExists(`_${thinkingText}_`);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiResponseId ? { ...msg, content: `_${thinkingText}_` } : msg
                    )
                  );
                } else if (data.navigate) {
                  // Backend fired navigate_to_page tool — perform immediate navigation
                  const navPath = data.navigate as string;
                  const navName = navPath.replace('/', '').replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Page';
                  ensureMessageExists(`↗️ Taking you to **${navName}**...`);
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId
                        ? {
                            ...msg,
                            content: `↗️ Taking you to **${navName}**...`,
                          }
                        : msg
                    )
                  );
                  setTimeout(() => router.push(navPath), 600);
                } else if (data.gradesData) {
                  ensureMessageExists();
                  fullText += `<UI:GradesTable>${JSON.stringify(data.gradesData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.attendanceData) {
                  ensureMessageExists();
                  fullText += `<UI:AttendanceTable>${JSON.stringify(data.attendanceData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.scheduleData) {
                  ensureMessageExists();
                  fullText += `<UI:ScheduleTable>${JSON.stringify(data.scheduleData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.text) {
                  ensureMessageExists();
                  fullText += data.text;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore parse errors from chunk fragmentation
              }
            }
          }
        }
      }

      // ── Post-stream: auto-detect bare suggestion arrays the model forgot to tag ──
      // Matches patterns like: some text... ["Option A", "Option B", "Option C"]
      if (fullText) {
        const bareChipsRegex = /(\[(?:\s*"[^"]*"\s*(?:,\s*"[^"]*"\s*)*)\])\s*$/;
        const chipMatch = fullText.match(bareChipsRegex);

        if (chipMatch && !fullText.includes('<UI:SuggestionChip>')) {
          const arrayStr = chipMatch[1];
          const beforeChips = fullText.slice(0, fullText.lastIndexOf(arrayStr)).trimEnd();
          fullText = `${beforeChips}\n<UI:SuggestionChip>${arrayStr}</UI>`;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiResponseId ? { ...msg, content: fullText } : msg
            )
          );
        }
      }

      // Attempt TTS read aloud
      speakText(fullText);

    } catch (error) {
      console.error("AI Error:", error);
      const message = isAuthError(error)
        ? "Your session has expired. Please sign in again to continue."
        : "I'm sorry, I'm having trouble connecting to my brain. Please try again later.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: message,
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
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
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
            style={{ width: `${width}px`, height: `${height}px` }}
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden glassmorphism"
          >
            {/* Resize Handles (North, West, North-West) */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-primary/20 transition-colors z-50"
              onMouseDown={(e) => handleResizeStart(e, "n")}
              onTouchStart={(e) => handleResizeStart(e, "n")}
            />
            <div
              className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize hover:bg-primary/20 transition-colors z-50"
              onMouseDown={(e) => handleResizeStart(e, "w")}
              onTouchStart={(e) => handleResizeStart(e, "w")}
            />
            <div
              className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/30 transition-colors z-50 flex items-center justify-center"
              onMouseDown={(e) => handleResizeStart(e, "nw")}
              onTouchStart={(e) => handleResizeStart(e, "nw")}
            >
              <div className="w-1.5 h-1.5 border-t border-l border-muted-foreground/60 rounded-tl-[1px] hover:border-primary" />
            </div>
            <div className="p-4 border-b flex items-center justify-between bg-muted/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">PEC AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Secure Backend Link
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`transition-colors ${isVoiceEnabled ? "text-primary" : "text-muted-foreground"}`}
                  title="Toggle Voice Output"
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:rotate-90 transition-transform duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${message.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none" : "bg-muted rounded-2xl rounded-tl-none"} px-4 py-2.5 shadow-sm`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      {(() => {
                        const content = message.content;
                        // Regex to match <UI:ComponentType>DATA</UI>
                        const uiRegex = /<UI:(GradesTable|AttendanceTable|ScheduleTable|SuggestionChip|Redirect)>([\s\S]*?)<\/UI>/g;
                        const parts = [];
                        let lastIndex = 0;
                        let match;
                        let hasTags = false;

                        while ((match = uiRegex.exec(content)) !== null) {
                          hasTags = true;
                          if (match.index > lastIndex) {
                            parts.push(content.substring(lastIndex, match.index));
                          }
                          
                          try {
                            const componentType = match[1];
                            const payload = match[2];
                            
                            if (componentType === 'Redirect') {
                              const targetPath = payload.trim();
                              setTimeout(() => router.push(targetPath), 800);
                              parts.push(
                                <div key={match.index} className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40 my-1">
                                  <span className="animate-pulse">↗</span>
                                  <span>Navigating to <span className="font-mono font-semibold">{targetPath}</span>...</span>
                                </div>
                              );
                            } else {
                              let cleanPayload = payload.replace(/```json/g, '').replace(/```/g, '').trim();
                              
                              // Extract valid JSON structure
                              const firstBrace = cleanPayload.indexOf('{');
                              const firstBracket = cleanPayload.indexOf('[');
                              const lastBrace = cleanPayload.lastIndexOf('}');
                              const lastBracket = cleanPayload.lastIndexOf(']');
                              
                              let startIdx = -1;
                              let endIdx = -1;
                              if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                                startIdx = firstBrace;
                                endIdx = lastBrace;
                              } else if (firstBracket !== -1) {
                                startIdx = firstBracket;
                                endIdx = lastBracket;
                              }
                              
                              if (startIdx !== -1 && endIdx !== -1) {
                                cleanPayload = cleanPayload.substring(startIdx, endIdx + 1);
                              }

                              const jsonData = JSON.parse(cleanPayload);
                              
                              if (componentType === 'GradesTable') {
                                parts.push(<GradesTable key={match.index} data={jsonData} />);
                              } else if (componentType === 'AttendanceTable') {
                                parts.push(<AttendanceTable key={match.index} data={jsonData} />);
                              } else if (componentType === 'ScheduleTable') {
                                parts.push(<ScheduleTable key={match.index} data={jsonData} />);
                              } else if (componentType === 'SuggestionChip') {
                                parts.push(<SuggestionChips key={match.index} chips={jsonData} onSelect={handleSend} />);
                              }
                            }
                          } catch (e) {
                            // If JSON parsing fails, just render the raw string
                            parts.push(match[0]);
                          }
                          
                          lastIndex = uiRegex.lastIndex;
                        }

                        if (lastIndex < content.length) {
                          parts.push(content.substring(lastIndex));
                        }

                        if (parts.length === 0 && !hasTags) parts.push(content);

                        return parts.map((part, i) => {
                          if (typeof part === 'string') {
                            if (message.role === 'assistant') {
                              return <TypewriterText key={i} text={part} onType={scrollToBottom} />;
                            }
                            return <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>;
                          }
                          return part;
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background/50">
              {/* Mic error banner */}
              {micError && (
                <div className="mb-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/40">
                  <span className="flex-1">{micError}</span>
                  <button onClick={() => setMicError(null)} className="text-red-400 hover:text-red-600 font-bold leading-none ml-1">×</button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-muted/50 p-2 rounded-xl border focus-within:ring-2 ring-primary/20 transition-all">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 shrink-0 rounded-lg transition-colors ${
                    isListening
                      ? 'text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={handleMicClick}
                  title={isListening ? "Stop listening" : "Voice Input"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? interimText
                        ? interimText  // show live partial transcript
                        : "🎤 Listening… speak now"
                      : "Ask me anything..."
                  }
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
                  rows={1}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isTyping || (!inputValue.trim() && !interimText.trim())}
                  size="icon"
                  className="h-9 w-9 rounded-lg shrink-0"
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
