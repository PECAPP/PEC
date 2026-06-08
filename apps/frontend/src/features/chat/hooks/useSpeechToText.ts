import { useState, useRef, useEffect } from 'react';

export const useSpeechToText = (onTranscriptFinal: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
    recognition.interimResults = true;
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
        onTranscriptFinal(final.trim());
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

  return { isListening, micError, setMicError, interimText, handleMicClick };
};
