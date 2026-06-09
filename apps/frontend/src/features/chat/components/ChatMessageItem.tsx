import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { TypewriterText } from './TypewriterText';

// Dynamic loaders for Generative UI
import dynamic from 'next/dynamic';
import { SuggestionChips } from '../generative/SuggestionChips';

const GradesTable = dynamic(() => import("../generative/GradesTable").then((mod) => mod.GradesTable), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">📊 Loading Grades...</div>,
  ssr: false,
});
const AttendanceTable = dynamic(() => import("../generative/AttendanceTable").then((mod) => mod.AttendanceTable), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">📅 Loading Attendance...</div>,
  ssr: false,
});
const ScheduleTable = dynamic(() => import("../generative/ScheduleTable").then((mod) => mod.ScheduleTable), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">🗓️ Loading Schedule...</div>,
  ssr: false,
});
const HostelIssuesList = dynamic(() => import("../generative/HostelIssuesList").then((mod) => mod.HostelIssuesList), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">🔧 Loading Maintenance Issues...</div>,
  ssr: false,
});
const CanteenMenuList = dynamic(() => import("../generative/CanteenMenuList").then((mod) => mod.CanteenMenuList), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">🍔 Loading Menu...</div>,
  ssr: false,
});
const FinanceSummaryCard = dynamic(() => import("../generative/FinanceSummaryCard").then((mod) => mod.FinanceSummaryCard), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">💳 Loading Dues & Fees...</div>,
  ssr: false,
});
const EventsList = dynamic(() => import("../generative/EventsList").then((mod) => mod.EventsList), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">🎉 Loading Calendar Events...</div>,
  ssr: false,
});
const ClubsList = dynamic(() => import("../generative/ClubsList").then((mod) => mod.ClubsList), {
  loading: () => <div className="w-full h-32 rounded-xl bg-muted/40 animate-pulse border border-muted flex items-center justify-center text-xs text-muted-foreground my-3">👥 Loading Student Clubs...</div>,
  ssr: false,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatMessageItem = ({
  message,
  onSend,
  scrollToBottom,
}: {
  message: Message;
  onSend: (text: string) => void;
  scrollToBottom: () => void;
}) => {
  const router = useRouter();
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
            : "bg-muted rounded-2xl rounded-tl-none"
        } px-4 py-2.5 shadow-sm`}
      >
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
          {(() => {
            const content = message.content;
            // Regex to match <UI:ComponentType>DATA</UI>
            const uiRegex =
              /<UI:(GradesTable|AttendanceTable|ScheduleTable|SuggestionChip|Redirect|HostelIssuesList|CanteenMenuList|NightCanteenMenuList|ClubsList|FinanceSummaryCard|EventsList)>([\s\S]*?)<\/UI>/g;
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

                if (componentType === "Redirect") {
                  const targetPath = payload.trim();
                  setTimeout(() => router.push(targetPath), 800);
                  parts.push(
                    <div
                      key={match.index}
                      className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/40 my-1"
                    >
                      <span className="animate-pulse">↗</span>
                      <span>
                        Navigating to <span className="font-mono font-semibold">{targetPath}</span>...
                      </span>
                    </div>
                  );
                } else {
                  let cleanPayload = payload
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();

                  // Extract valid JSON structure
                  const firstBrace = cleanPayload.indexOf("{");
                  const firstBracket = cleanPayload.indexOf("[");
                  const lastBrace = cleanPayload.lastIndexOf("}");
                  const lastBracket = cleanPayload.lastIndexOf("]");

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

                  if (componentType === "GradesTable") {
                    parts.push(<GradesTable key={match.index} data={jsonData} />);
                  } else if (componentType === "AttendanceTable") {
                    parts.push(<AttendanceTable key={match.index} data={jsonData} />);
                  } else if (componentType === "ScheduleTable") {
                    parts.push(<ScheduleTable key={match.index} data={jsonData} />);
                  } else if (componentType === "SuggestionChip") {
                    parts.push(
                      <SuggestionChips key={match.index} chips={jsonData} onSelect={onSend} />
                    );
                  } else if (componentType === "HostelIssuesList") {
                    parts.push(<HostelIssuesList key={match.index} data={jsonData} />);
                  } else if (componentType === "CanteenMenuList") {
                    parts.push(<CanteenMenuList key={match.index} data={jsonData} />);
                  } else if (componentType === "NightCanteenMenuList") {
                    parts.push(<CanteenMenuList key={match.index} data={jsonData} isNight={true} />);
                  } else if (componentType === "ClubsList") {
                    parts.push(<ClubsList key={match.index} data={jsonData} />);
                  } else if (componentType === "FinanceSummaryCard") {
                    parts.push(<FinanceSummaryCard key={match.index} data={jsonData} />);
                  } else if (componentType === "EventsList") {
                    parts.push(<EventsList key={match.index} data={jsonData} />);
                  }
                }
              } catch (_e) {
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
              if (typeof part === "string") {
                if (message.role === "assistant") {
                  return <TypewriterText key={i} text={part} onType={scrollToBottom} />;
                }
                return (
                  <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                    {part}
                  </ReactMarkdown>
                );
              }
              return part;
            });
          })()}
        </div>
      </div>
    </div>
  );
};
