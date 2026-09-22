import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/neurospeak-logo.png";
import {
  MessageSquare,
  Shield,
  Brain,
  Activity,
  ArrowRight,
} from "lucide-react";
import { haptics } from "@/lib/haptics";

const highlights = [
  { icon: MessageSquare, text: "Express needs instantly" },
  { icon: Shield, text: "Emergency safety alerts" },
  { icon: Brain, text: "Caregiver insights" },
  { icon: Activity, text: "Activity monitoring" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Background */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[48%] rounded-b-[2.5rem] bg-gradient-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />

      {/* Ambient glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-20 h-16 w-16 rounded-full bg-primary-foreground/5 blur-xl sm:h-20 sm:w-20"
        animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-36 h-12 w-12 rounded-full bg-primary-foreground/5 blur-lg sm:h-14 sm:w-14"
        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col px-4 sm:px-6">
        {/* Hero */}
        <section className="flex shrink-0 flex-col items-center pt-10 text-center sm:pt-14">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 16,
            }}
          >
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-primary-foreground/15 blur-lg"
              />

              <img
                src={logo}
                alt="NeuroSpeak Logo"
                className="relative z-10 h-16 w-16 drop-shadow-lg sm:h-20 sm:w-20"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl"
          >
            NeuroSpeak
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-1 text-sm font-medium text-primary-foreground/80 sm:text-base"
          >
            Voice Beyond Words
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 max-w-[300px] text-xs leading-5 text-primary-foreground/65 sm:text-sm"
          >
            AI-powered assistive communication that helps you express
            yourself effortlessly.
          </motion.p>
        </section>

        {/* Highlights */}
        <section className="mt-7 flex-1 sm:mt-10">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {highlights.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card/90 p-3 shadow-card backdrop-blur-sm sm:gap-3 sm:p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>

                  <span className="min-w-0 text-[11px] font-medium leading-4 text-card-foreground sm:text-xs">
                    {item.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:pb-7 sm:pt-6"
        >
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                haptics.medium();
                navigate("/role-select");
              }}
              className="h-12 w-full rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-elevated sm:h-14 sm:text-base"
            >
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            </Button>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
};

export default Landing;