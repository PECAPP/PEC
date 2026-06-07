import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const TypewriterText = ({ text, onType }: { text: string; onType?: () => void }) => {
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
