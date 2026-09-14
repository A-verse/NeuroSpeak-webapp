import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import MobileLayout from "@/components/MobileLayout";
import {
  Hand,
  Droplets,
  UtensilsCrossed,
  Moon,
  AlertTriangle,
  Watch,
  Mic,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { haptics } from "@/lib/haptics";

const quickActions = [
  { label: "I Need Help", icon: Hand, urgent: true },
  { label: "I Am Hungry", icon: UtensilsCrossed, urgent: false },
  { label: "I Need Water", icon: Droplets, urgent: false },
  { label: "I Am Tired", icon: Moon, urgent: false },
  { label: "I Am In Pain", icon: AlertTriangle, urgent: true },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const HOLD_DURATION = 1500;

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.03,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 5,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const UserHome = () => {
  const { userName } = useApp();
  const navigate = useNavigate();
  const { addNotification, notifications } = useNotifications();

  const greeting = useMemo(() => getGreeting(), []);

  const unreadAlerts = notifications.filter(
    (notification) =>
      !notification.read && notification.roles.includes("user"),
  ).length;

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);

  const clearHold = useCallback(() => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
    }

    holdInterval.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (isHolding) return;

    haptics.light();

    holdStart.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);

    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;

      const progress = Math.min(
        (elapsed / HOLD_DURATION) * 100,
        100,
      );

      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdInterval.current) {
          clearInterval(holdInterval.current);
        }

        holdInterval.current = null;
        setIsHolding(false);
        setHoldProgress(0);

        haptics.emergency();

        addNotification({
          type: "emergency",
          title: "Emergency Activated",
          body: "Emergency alert sent to all caregivers.",
          roles: ["user", "caregiver"],
        });

        navigate("/emergency");
      }
    }, 50);
  }, [addNotification, isHolding, navigate]);

  useEffect(() => {
    return () => {
      clearHold();
    };
  }, [clearHold]);

  const handleQuickAction = (label: string) => {
    haptics.medium();

    navigate(
      `/user/voice?phrase=${encodeURIComponent(label)}`,
    );
  };

  const displayName = userName || null;

  return (
    <MobileLayout role="user">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="
          mx-auto
          flex
          min-h-0
          w-full
          min-w-0
          max-w-3xl
          flex-col
          overflow-x-hidden
          px-4
          pb-20
          pt-3
          sm:px-5
          sm:pt-4
          lg:px-6
        "
      >
        {/* Header */}

        <motion.div
          variants={fadeUp}
          className="min-w-0 shrink-0"
        >
          <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
            {greeting}
          </p>

          <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {displayName ? `Hello, ${displayName}` : "Hello"}
          </h1>

          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            How can we help today?
          </p>
        </motion.div>

        {/* Unread alert */}

        {unreadAlerts > 0 && (
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() => navigate("/user/alerts")}
            className="
              mt-2.5
              flex
              min-h-9
              w-full
              min-w-0
              shrink-0
              items-center
              gap-2
              rounded-lg
              border
              border-warning/30
              bg-warning/10
              px-3
              py-1.5
              text-left
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />

            <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-warning sm:text-xs">
              {unreadAlerts} unread alert
              {unreadAlerts > 1 ? "s" : ""}
            </span>

            <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-warning/70">
              View
              <ChevronRight className="h-3 w-3" />
            </span>
          </motion.button>
        )}

        {/* Primary actions */}

        <div
          className="
            mt-3
            grid
            min-w-0
            shrink-0
            grid-cols-1
            gap-2.5
            sm:mt-4
            sm:gap-3
            md:grid-cols-2
          "
        >
          {/* Emergency */}

          <motion.div
            variants={fadeUp}
            className="min-w-0"
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Emergency SOS — hold to activate"
              onPointerDown={startHold}
              onPointerUp={clearHold}
              onPointerLeave={clearHold}
              onPointerCancel={clearHold}
              onKeyDown={(event) => {
                if (
                  (event.key === " " ||
                    event.key === "Enter") &&
                  !isHolding
                ) {
                  event.preventDefault();
                  startHold();
                }
              }}
              onKeyUp={(event) => {
                if (
                  event.key === " " ||
                  event.key === "Enter"
                ) {
                  event.preventDefault();
                  clearHold();
                }
              }}
              className="
                relative
                flex
                h-[82px]
                w-full
                min-w-0
                touch-none
                select-none
                items-center
                overflow-hidden
                rounded-2xl
                bg-gradient-danger
                px-3.5
                text-destructive-foreground
                shadow-card
                outline-none
                focus-visible:ring-2
                focus-visible:ring-destructive-foreground
                sm:h-[88px]
                sm:px-4
              "
            >
              <motion.div
                className="
                  absolute
                  inset-y-0
                  left-0
                  origin-left
                  bg-destructive-foreground/10
                "
                initial={false}
                animate={{
                  scaleX: holdProgress / 100,
                }}
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  w-full
                  min-w-0
                  items-center
                  gap-2.5
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-destructive-foreground/15
                    sm:h-11
                    sm:w-11
                  "
                >
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold sm:text-base">
                    {isHolding
                      ? "Activating SOS..."
                      : "Emergency SOS"}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-destructive-foreground/75 sm:text-[11px]">
                    {isHolding
                      ? "Keep holding to activate"
                      : "Hold for 1.5 seconds"}
                  </p>
                </div>

                {isHolding && (
                  <span className="shrink-0 text-[11px] font-bold">
                    {Math.round(holdProgress)}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Type & Speak */}

          <motion.div
            variants={fadeUp}
            className="min-w-0"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptics.light();
                navigate("/user/communicate");
              }}
              className="
                flex
                h-[82px]
                w-full
                min-w-0
                items-center
                gap-2.5
                rounded-2xl
                bg-gradient-primary
                px-3.5
                text-left
                shadow-card
                sm:h-[88px]
                sm:px-4
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/20
                  sm:h-11
                  sm:w-11
                "
              >
                <Mic className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-primary-foreground sm:text-base">
                  Type &amp; Speak
                </p>

                <p className="mt-0.5 truncate text-[10px] text-primary-foreground/75 sm:text-[11px]">
                  Type any message and speak it aloud
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-primary-foreground/60" />
            </motion.button>
          </motion.div>
        </div>

        {/* Quick Communicate */}

        <motion.section
          variants={fadeUp}
          className="mt-4 min-w-0 shrink-0 sm:mt-5"
        >
          <div className="mb-2">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
              Quick Communicate
            </h2>

            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
              Tap a phrase to speak it
            </p>
          </div>

          <motion.div
            variants={stagger}
            className="
              grid
              min-w-0
              grid-cols-2
              gap-2
              sm:gap-2.5
              lg:grid-cols-3
            "
          >
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.label}
                  type="button"
                  variants={fadeUp}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    handleQuickAction(action.label)
                  }
                  className="
                    flex
                    h-[58px]
                    min-w-0
                    items-center
                    gap-2
                    overflow-hidden
                    rounded-xl
                    border
                    border-border
                    bg-card
                    px-2.5
                    shadow-card
                    transition-all
                    hover:border-primary/30
                    hover:shadow-elevated
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    sm:h-[62px]
                    sm:px-3
                  "
                >
                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      sm:h-9
                      sm:w-9
                      ${action.urgent
                        ? "bg-destructive/10"
                        : "bg-primary/10"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-4
                        w-4
                        ${action.urgent
                          ? "text-destructive"
                          : "text-primary"
                        }
                      `}
                    />
                  </div>

                  <span
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-left
                      text-[10px]
                      font-semibold
                      leading-4
                      text-card-foreground
                      sm:text-[11px]
                    "
                  >
                    {action.label}
                  </span>

                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                </motion.button>
              );
            })}
          </motion.div>
        </motion.section>

        {/* Health Monitor */}

        <motion.section
          variants={fadeUp}
          className="
            mt-3
            min-w-0
            shrink-0
            rounded-xl
            border
            border-border
            bg-card
            p-3
            shadow-card
            sm:mt-4
            sm:p-3.5
          "
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
              "
            >
              <Watch className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-card-foreground sm:text-sm">
                Health Monitor
              </p>

              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                Wearable not connected
              </p>
            </div>

            <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
          </div>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-border/70 pt-2">
            <p className="min-w-0 flex-1 truncate text-[9px] text-muted-foreground sm:text-[10px]">
              Connect a supported device to sync health data.
            </p>

            <button
              type="button"
              onClick={() => navigate("/wearable/setup")}
              className="
                shrink-0
                whitespace-nowrap
                rounded-md
                px-2
                py-1
                text-[10px]
                font-bold
                text-primary
                transition
                hover:bg-primary/10
              "
            >
              Set up
            </button>
          </div>
        </motion.section>
      </motion.div>
    </MobileLayout>
  );
};

export default UserHome;