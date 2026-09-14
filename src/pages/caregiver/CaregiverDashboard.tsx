import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import { useApp } from "@/contexts/AppContext";
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Brain,
  ChevronRight,
  Watch,
  UserCircle,
  WifiOff,
  MapPin,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  {
    label: "Track Location",
    icon: MapPin,
    path: "/caregiver/tracking",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    path: "/caregiver/chat",
  },
  {
    label: "Activity Timeline",
    icon: Clock,
    path: "/caregiver/timeline",
  },
];

const CaregiverDashboard = () => {
  const navigate = useNavigate();

  const { notifications } =
    useNotifications();

  const { userName } = useApp();

  const unreadAlerts =
    notifications.filter(
      (notification) =>
        !notification.read &&
        notification.roles.includes(
          "caregiver",
        ),
    ).length;

  const messageCount =
    notifications.filter(
      (notification) =>
        notification.type ===
        "message" &&
        notification.roles.includes(
          "caregiver",
        ) &&
        !notification.read,
    ).length;

  return (
    <MobileLayout role="caregiver">
      <div
        className="
          min-h-full
          w-full
          min-w-0
          overflow-x-hidden
          px-4
          py-4
          sm:px-6
          sm:py-6
          lg:mx-auto
          lg:max-w-5xl
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5"
        >
          <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
            {getGreeting()}
          </p>

          <h1
            className="
              mt-0.5
              text-2xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >
            {userName
              ? `Hello, ${userName}`
              : "Caregiver Dashboard"}
          </h1>

          <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
            Keep track of communication, safety, and activity.
          </p>
        </motion.div>

        {/* ============================================================
            PATIENT CONNECTION
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-4
            shadow-card
            sm:p-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-muted
              "
            >
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-card-foreground">
                  Patient
                </p>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-muted
                    px-2
                    py-0.5
                    text-[8px]
                    font-medium
                    text-muted-foreground
                    sm:text-[9px]
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  Not connected
                </span>
              </div>

              <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                Patient information will appear after an account is linked.
              </p>
            </div>

            <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </div>
        </motion.div>

        {/* ============================================================
            ALERTS + MESSAGES
        ============================================================ */}

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2.5
            sm:gap-3
          "
        >
          <motion.button
            type="button"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
            }}
            onClick={() =>
              navigate(
                "/caregiver/alerts",
              )
            }
            className="
              min-w-0
              rounded-2xl
              border
              border-border
              bg-card
              p-3
              text-left
              shadow-card
              transition
              hover:border-primary/40
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:p-4
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-muted
                "
              >
                <AlertTriangle
                  className={`h-4 w-4 ${unreadAlerts > 0
                      ? "text-warning"
                      : "text-muted-foreground"
                    }`}
                />
              </div>

              {unreadAlerts > 0 && (
                <span className="h-2 w-2 rounded-full bg-warning" />
              )}
            </div>

            <p
              className={`
                mt-3
                text-2xl
                font-bold
                ${unreadAlerts > 0
                  ? "text-foreground"
                  : "text-muted-foreground"
                }
              `}
            >
              {unreadAlerts}
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              Unread Alerts
            </p>
          </motion.button>

          <motion.button
            type="button"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
            }}
            onClick={() =>
              navigate(
                "/caregiver/chat",
              )
            }
            className="
              min-w-0
              rounded-2xl
              border
              border-border
              bg-card
              p-3
              text-left
              shadow-card
              transition
              hover:border-primary/40
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:p-4
            "
          >
            <div className="flex items-center justify-between">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary/10
                "
              >
                <MessageSquare
                  className={`h-4 w-4 ${messageCount > 0
                      ? "text-primary"
                      : "text-muted-foreground"
                    }`}
                />
              </div>

              {messageCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>

            <p
              className={`
                mt-3
                text-2xl
                font-bold
                ${messageCount > 0
                  ? "text-foreground"
                  : "text-muted-foreground"
                }
              `}
            >
              {messageCount}
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              Unread Messages
            </p>
          </motion.button>
        </div>

        {/* ============================================================
            QUICK ACTIONS
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.22,
          }}
          className="mt-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">
              Quick Actions
            </h2>

            <span className="text-[9px] text-muted-foreground sm:text-[10px]">
              Patient tools
            </span>
          </div>

          <div
            className="
              grid
              gap-2
              sm:grid-cols-3
              sm:gap-3
            "
          >
            {quickActions.map(
              (action, index) => {
                const Icon =
                  action.icon;

                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        0.25 +
                        index * 0.05,
                    }}
                    onClick={() =>
                      navigate(
                        action.path,
                      )
                    }
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-border
                      bg-card
                      p-3
                      text-left
                      shadow-card
                      transition
                      hover:border-primary/40
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                      "
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-card-foreground">
                      {action.label}
                    </span>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </motion.button>
                );
              },
            )}
          </div>
        </motion.div>

        {/* ============================================================
            AI + WEARABLE
        ============================================================ */}

        <div
          className="
            mt-5
            grid
            gap-3
            lg:grid-cols-2
          "
        >
          {/* AI */}

          <motion.button
            type="button"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            onClick={() =>
              navigate(
                "/caregiver/analysis",
              )
            }
            className="
              min-w-0
              rounded-2xl
              border
              border-border
              bg-muted/50
              p-4
              text-left
              transition
              hover:border-primary/30
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary/10
                "
              >
                <Brain className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                  AI Analysis
                </p>

                <p className="text-[9px] text-muted-foreground">
                  Waiting for patient data
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
              Communication and behavioral insights will appear once
              sufficient patient data is available.
            </p>
          </motion.button>

          {/* Wearable */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.45,
            }}
            className="
              min-w-0
              rounded-2xl
              border
              border-border
              bg-muted/50
              p-4
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-muted
                "
              >
                <Watch className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                  Wearable Data
                </p>

                <p className="text-[9px] text-muted-foreground">
                  Not connected
                </p>
              </div>

              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            </div>

            <p className="mt-3 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
              Health and activity information will appear when a supported
              device or health source is connected.
            </p>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default CaregiverDashboard;