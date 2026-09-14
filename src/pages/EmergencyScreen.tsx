import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Phone,
  Heart,
  X,
  UserCircle,
  ShieldAlert,
} from "lucide-react";
import { haptics } from "@/lib/haptics";

type Phase = "alerting" | "breathing";

const EmergencyScreen = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("alerting");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">(
    "inhale",
  );
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    haptics.emergency();

    const timer = window.setTimeout(() => {
      setPhase("breathing");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "breathing") return;

    const interval = window.setInterval(() => {
      setBreathPhase((current) =>
        current === "inhale" ? "exhale" : "inhale",
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [phase]);

  const handleCancelSOS = () => {
    haptics.medium();
    setIsCancelling(true);
  };

  const confirmCancel = () => {
    haptics.light();
    setIsCancelling(false);

    // TODO:
    // Replace this with the real Supabase SOS cancellation call
    // once SOS backend persistence is connected.

    navigate(-1);
  };

  return (
    <main className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-danger">
      {/* Cancel confirmation */}
      <AnimatePresence>
        {isCancelling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-elevated sm:p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>

              <h2 className="mb-2 text-lg font-bold text-foreground">
                Cancel Emergency?
              </h2>

              <p className="mb-5 text-sm leading-5 text-muted-foreground">
                Are you sure you want to cancel the current SOS?
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Keep SOS Active
                </button>

                <button
                  type="button"
                  onClick={confirmCancel}
                  className="min-h-11 flex-1 rounded-xl bg-success px-4 text-sm font-semibold text-success-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={() => {
            haptics.light();
            navigate(-1);
          }}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive-foreground/10 text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-destructive-foreground/10 px-3 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" />
          <span className="text-xs font-semibold text-destructive-foreground">
            SOS ACTIVE
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* Main content */}
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-4 sm:px-6">
        <AnimatePresence mode="wait">
          {phase === "alerting" && (
            <motion.div
              key="alerting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md text-center"
            >
              {/* Alert icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-destructive-foreground/15 sm:h-24 sm:w-24"
              >
                <AlertTriangle className="h-10 w-10 text-destructive-foreground sm:h-12 sm:w-12" />
              </motion.div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-destructive-foreground/70">
                Emergency mode
              </p>

              <h1 className="text-2xl font-bold text-destructive-foreground sm:text-3xl">
                SOS is active
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-destructive-foreground/70">
                Your emergency screen is active. Connect this action to the
                backend notification service to notify caregivers.
              </p>

              {/* Current action */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-destructive-foreground/10 px-4 py-3 text-left">
                <Phone className="h-5 w-5 shrink-0 text-destructive-foreground" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-destructive-foreground">
                    Emergency notification
                  </p>
                  <p className="mt-0.5 text-xs text-destructive-foreground/60">
                    Backend notification is not connected yet.
                  </p>
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                  className="h-4 w-4 shrink-0 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground"
                />
              </div>

              {/* Contacts */}
              <div className="mt-3 rounded-2xl bg-destructive-foreground/10 p-4 text-left">
                <div className="mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-destructive-foreground/70" />
                  <span className="text-xs font-semibold text-destructive-foreground/70">
                    Emergency contacts
                  </span>
                </div>

                <p className="text-xs leading-5 text-destructive-foreground/60">
                  Add emergency contacts from Profile → Emergency Contacts.
                  They will appear here once real contact persistence is
                  connected.
                </p>
              </div>
            </motion.div>
          )}

          {phase === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md text-center"
            >
              <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-destructive-foreground/10 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-semibold text-destructive-foreground">
                  SOS remains active
                </span>
              </div>

              <h2 className="text-xl font-bold text-destructive-foreground sm:text-2xl">
                Stay calm
              </h2>

              <p className="mt-1 text-sm text-destructive-foreground/70">
                Take a slow breath while help is arranged.
              </p>

              <div className="my-6">
                <motion.div
                  animate={{
                    scale:
                      breathPhase === "inhale"
                        ? [1, 1.25]
                        : [1.25, 1],
                  }}
                  transition={{
                    duration: breathPhase === "inhale" ? 4 : 6,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-destructive-foreground/15 sm:h-32 sm:w-32"
                >
                  <Heart className="h-10 w-10 text-destructive-foreground sm:h-12 sm:w-12" />
                </motion.div>

                <motion.p
                  key={breathPhase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-xl font-bold text-destructive-foreground"
                >
                  {breathPhase === "inhale"
                    ? "Breathe in"
                    : "Breathe out"}
                </motion.p>

                <p className="mt-1 text-xs text-destructive-foreground/60">
                  {breathPhase === "inhale"
                    ? "Slowly for 4 seconds"
                    : "Slowly for 6 seconds"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Bottom controls */}
      <footer className="shrink-0 space-y-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-5">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleCancelSOS}
          whileTap={{ scale: 0.98 }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-bold text-success-foreground shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
        >
          <X className="h-5 w-5" />
          Cancel SOS / I am Safe
        </motion.button>

        <button
          type="button"
          onClick={() => {
            haptics.light();
            navigate(-1);
          }}
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-destructive-foreground/10 px-5 text-xs font-medium text-destructive-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </footer>
    </main>
  );
};

export default EmergencyScreen;