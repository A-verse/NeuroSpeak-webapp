/**
 * EmotionDashboard.tsx
 *
 * Displays AI-inferred emotional/stress state for caregivers.
 *
 * NO hardcoded stress levels, fabricated behavioral signals, or fake
 * emotion timelines are shown here.
 *
 * Real data requires:
 *  - Backend AI analysis of patient interaction patterns
 *  - Supabase table: ai_insights (see database.sql)
 *  - Frontend subscription to ai_insights via Supabase Realtime
 *
 * Until that pipeline is connected, this screen shows an honest setup state.
 */
import { motion } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import { Brain, MessageSquare, Clock, Activity, Info } from "lucide-react";

const signals = [
  { icon: MessageSquare, label: "Message Frequency", description: "How often the patient communicates" },
  { icon: Clock, label: "Interaction Delay", description: "Average time to respond to prompts" },
  { icon: Activity, label: "Alert Triggers", description: "Emergency / SOS events in the day" },
  { icon: Brain, label: "Category Usage", description: "Variety of communication board categories used" },
];

const EmotionDashboard = () => (
  <MobileLayout role="caregiver">
    <div className="px-5 pt-6 pb-10">
      <h1 className="text-xl font-bold text-foreground mb-1">Emotion Detection</h1>
      <p className="text-muted-foreground text-sm mb-6">AI behavioral analysis</p>

      {/* Empty state hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-6 shadow-card border border-border mb-6 flex flex-col items-center text-center"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Brain className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-card-foreground mb-2">No emotion data yet</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Emotional state detection will appear here once the AI analysis pipeline is connected
          and the patient begins using the app.
        </p>
      </motion.div>

      {/* Behavioral signals — what will be tracked */}
      <h2 className="font-semibold text-foreground mb-3">Signals to be tracked</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {signals.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="rounded-xl bg-card p-4 shadow-card border border-border"
          >
            <s.icon className="h-4 w-4 text-primary mb-2" />
            <p className="text-sm font-semibold text-card-foreground leading-snug">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Setup note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-muted/60 border border-border p-4 flex items-start gap-2"
      >
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Emotion detection requires real-time analysis of communication patterns.
          No data is fabricated — this dashboard will populate automatically once
          the AI backend is integrated.
        </p>
      </motion.div>
    </div>
  </MobileLayout>
);

export default EmotionDashboard;
