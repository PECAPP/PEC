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
import { Bot, Send, X, Mic, Volume2, VolumeX } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {  isAuthError  } from "@pec/api";
import {  buildApiUrl  } from "@pec/api";
import {  authClient  } from "@pec/api";
import { useRouter } from "next/navigation";
import { useResizable } from "./hooks/useResizable";
import { useSpeechToText } from "./hooks/useSpeechToText";
import { ChatMessageItem } from "./components/ChatMessageItem";

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

4. HOSTEL ISSUES — call tool get_hostel_issues. The issues list will be shown automatically.
   After the tool runs, write a short 1-2 sentence summary. Do NOT repeat or list raw data.

5. CANTEEN MENU — call tool get_canteen_menu or get_night_canteen_menu. The menu will be shown automatically.
   After the tool runs, write a short 1-2 sentence summary. Do NOT repeat or list raw data.

6. CLUBS — call tool get_clubs. The clubs list will be shown automatically.
   After the tool runs, write a short 1-2 sentence summary. Do NOT repeat or list raw data.

7. FINANCE/FEES — call tool get_finance_summary. The summary card will be shown automatically.
   After the tool runs, write a short 1-2 sentence summary. Do NOT repeat or list raw data.

8. EVENTS/CALENDAR — call tool get_upcoming_events. The events list will be shown automatically.
   After the tool runs, write a short 1-2 sentence summary of the next upcoming event. Do NOT repeat or list raw data.

9. NAVIGATION — when user asks to go to, visit, open, or be taken to any page:
   ALWAYS call the navigate_to_page tool. Do NOT write the path as text.
   Valid pages: Marketplace, Attendance, Grades, Timetable, Noticeboard, Canteen, Finance, Profile, Clubs, Hostel, Dashboard.
   After the tool runs, write a short friendly confirmation (e.g. "Taking you to the Marketplace now! ").

10. QUICK REPLIES — always end with 2-3 options:
<UI:SuggestionChip>["option 1", "option 2", "option 3"]</UI>

Rules:
- Do NOT emit components like <UI:GradesTable>, <UI:HostelIssuesList>, or <UI:CanteenMenuList> tags — the system handles that automatically.
- Do NOT invent any data. If a tool fails or returns empty, tell the user clearly.
- Keep responses concise and helpful.
`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Sizing physics extracted to custom hook
  const { width, height, handleResizeStart } = useResizable();

  // Speech-to-text logic extracted to custom hook
  const { isListening, micError, setMicError, interimText, handleMicClick } = useSpeechToText(
    (finalText) => setInputValue((prev) => (prev ? prev + " " : "") + finalText)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    if (authLoading) return;

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

      const fetchRes = await fetch(fullUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
      let buffer = ""; // Buffer to handle network data splitting / fragmentation

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          // Stream decoding
          const chunk = decoder.decode(value, { stream: !done });
          const text = buffer + chunk;
          const lines = text.split('\n');
          buffer = lines.pop() || ""; // Save partial line for next iteration
          
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
                  let thinkingText = "️ Working...";
                  if (data.tool === "get_user_grades") thinkingText = " Fetching your academic transcript...";
                  else if (data.tool === "get_user_attendance") thinkingText = " Calculating your attendance & predictions...";
                  else if (data.tool === "get_user_schedule") thinkingText = "️ Loading your weekly timetable...";
                  else if (data.tool === "navigate_to_page") thinkingText = " Navigating...";
                  else if (data.tool === "search_marketplace") thinkingText = "️ Searching the marketplace...";
                  else if (data.tool === "get_upcoming_events") thinkingText = " Finding upcoming college events...";
                  else if (data.tool === "search_college_notices") thinkingText = " Scanning college notices...";
                  else if (data.tool === "get_hostel_issues") thinkingText = " Loading reported hostel issues...";
                  else if (data.tool === "get_canteen_menu") thinkingText = " Fetching day canteen menu...";
                  else if (data.tool === "get_night_canteen_menu") thinkingText = " Fetching night canteen menu...";
                  else if (data.tool === "get_clubs") thinkingText = " Retrieving list of student clubs...";
                  else if (data.tool === "get_finance_summary") thinkingText = " Gathering your pending dues & fee status...";
                  
                  ensureMessageExists(`_${thinkingText}_`);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiResponseId ? { ...msg, content: `_${thinkingText}_` } : msg
                    )
                  );
                } else if (data.navigate) {
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
                } else if (data.hostelIssuesData) {
                  ensureMessageExists();
                  fullText += `<UI:HostelIssuesList>${JSON.stringify(data.hostelIssuesData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.canteenData) {
                  ensureMessageExists();
                  fullText += `<UI:CanteenMenuList>${JSON.stringify(data.canteenData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.nightCanteenData) {
                  ensureMessageExists();
                  fullText += `<UI:NightCanteenMenuList>${JSON.stringify(data.nightCanteenData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.clubsData) {
                  ensureMessageExists();
                  fullText += `<UI:ClubsList>${JSON.stringify(data.clubsData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.financeData) {
                  ensureMessageExists();
                  fullText += `<UI:FinanceSummaryCard>${JSON.stringify(data.financeData)}</UI>`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiResponseId ? { ...msg, content: fullText } : msg
                    )
                  );
                } else if (data.eventsData) {
                  ensureMessageExists();
                  fullText += `<UI:EventsList>${JSON.stringify(data.eventsData)}</UI>`;
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
              } catch (_e) {
                // Ignore parse errors from chunk fragmentation
              }
            }
          }
        }
      }

      // If the model printed suggest arrays, tag them
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
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] flex flex-col rounded-sm border bg-card shadow-2xl overflow-hidden glassmorphism"
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
                <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center">
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
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onSend={handleSend}
                  scrollToBottom={scrollToBottom}
                />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2.5 rounded-sm rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background/50">
              {micError && (
                <div className="mb-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-sm border border-red-200 dark:border-red-800/40">
                  <span className="flex-1">{micError}</span>
                  <button onClick={() => setMicError(null)} className="text-red-400 hover:text-red-600 font-bold leading-none ml-1">×</button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-muted/50 p-2 rounded-sm border focus-within:ring-2 ring-primary/20 transition-all">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 shrink-0 rounded-sm transition-colors ${
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
                        ? interimText
                        : " Listening… speak now"
                      : "Ask me anything..."
                  }
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
                  rows={1}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isTyping || (!inputValue.trim() && !interimText.trim())}
                  size="icon"
                  className="h-9 w-9 rounded-sm shrink-0"
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
