import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, RotateCcw, ArrowLeft, VolumeX, Square } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { useTTS } from "@/hooks/useTTS";
import { useApp } from "@/contexts/AppContext";

const VoiceOutput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phrase = searchParams.get("phrase") || "I need help";
  const { speechRate } = useApp();
  const { speak, stop, isSpeaking, isSupported } = useTTS({ rate: speechRate });

  // Auto-speak on mount
  useEffect(() => {
    const timer = setTimeout(() => speak(phrase), 500);
    return () => {
      clearTimeout(timer);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 max-w-[480px] mx-auto relative">
      <motion.button
        onClick={() => {
          haptics.light();
          stop();
          navigate(-1);
        }}
        className="absolute top-6 left-6 flex items-center gap-2 text-primary font-medium"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ x: -3 }}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="text-center"
      >
        {/* Sound wave rings */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border-2 border-primary/15"
              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border-2 border-primary/10"
              animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 1 }}
            />
          </>
        )}

        {/* Speaker icon */}
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="relative z-10"
        >
          <motion.div
            className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-300 ${
              isSpeaking ? "bg-primary shadow-glow" : "bg-muted"
            }`}
            whileTap={{ scale: 0.92 }}
            onClick={() => (isSpeaking ? stop() : speak(phrase))}
          >
            <motion.div
              key={isSpeaking ? "on" : "off"}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {isSpeaking ? (
                <Volume2 className="h-12 w-12 text-primary-foreground" />
              ) : (
                <VolumeX className="h-12 w-12 text-muted-foreground" />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Phrase text */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold text-foreground mb-4 leading-tight"
        >
          &ldquo;{phrase}&rdquo;
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-sm mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {!isSupported ? (
            <span className="text-warning">Text-to-speech not supported in this browser</span>
          ) : isSpeaking ? (
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              Speaking…
            </motion.span>
          ) : (
            "Tap to speak again"
          )}
        </motion.p>

        {/* Actions */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isSpeaking ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { haptics.light(); stop(); }}
              className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center text-destructive shadow-elevated"
              aria-label="Stop speaking"
            >
              <Square className="h-7 w-7 fill-current" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9, rotate: -180 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => { haptics.medium(); speak(phrase); }}
              disabled={!isSupported}
              className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-elevated disabled:opacity-40"
              aria-label="Speak again"
            >
              <RotateCcw className="h-7 w-7 text-primary-foreground" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceOutput;
