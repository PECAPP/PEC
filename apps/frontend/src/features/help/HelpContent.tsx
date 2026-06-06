import React from 'react';

interface HelpContentProps {
  content: string;
}

export function HelpContent({ content }: HelpContentProps) {
  // Split the content by the ** delimiter
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border whitespace-pre-wrap leading-relaxed text-foreground/90">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Remove the ** and wrap in strong tag
          return (
            <strong key={index} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
