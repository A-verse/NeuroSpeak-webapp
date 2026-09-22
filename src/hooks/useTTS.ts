/**
 * useTTS — Text-to-Speech hook
 *
 * Wraps window.speechSynthesis behind a clean integration boundary.
 * To swap in a native Capacitor TTS plugin later, replace only this file.
 *
 * TODO (mobile): Replace speechSynthesis calls with @capacitor-community/text-to-speech
 *   when building the native Capacitor app.
 */
import { useState, useCallback, useRef } from "react";

export interface TTSOptions {
  rate?: number;   // 0.1 – 10, default 0.9
  pitch?: number;  // 0 – 2, default 1.0
  volume?: number; // 0 – 1, default 1.0
}

export interface TTSHook {
  speak: (text: string, options?: TTSOptions) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function useTTS(defaultOptions?: TTSOptions): TTSHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (text: string, options?: TTSOptions) => {
      if (!isSupported || !text.trim()) return;

      // Cancel any in-progress speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = options?.rate ?? defaultOptions?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? defaultOptions?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? defaultOptions?.volume ?? 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [defaultOptions]
  );

  return { speak, stop, isSpeaking, isSupported };
}
