import MobileLayout from "@/components/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  MessageSquare,
  Activity,
  Clock,
  Bell,
  X,
  Trash2,
} from "lucide-react";
import {
  useNotifications,
  type Notification,
} from "@/contexts/NotificationContext";

interface AlertsScreenProps {
  role: "user" | "caregiver";
}

const typeConfig: Record<
  Notification["type"],
  {
    icon: React.ElementType;
    card: string;
    icon_color: string;
  }
> = {
  emergency: {
    icon: AlertTriangle,
    card: "bg-destructive/10 border-destructive/20",
    icon_color: "text-destructive",
  },
  alert: {
    icon: Activity,
    card: "bg-warning/10 border-warning/20",
    icon_color: "text-warning",
  },
  message: {
    icon: MessageSquare,
    card: "bg-primary/10 border-primary/20",
    icon_color: "text-primary",
  },
  health: {
    icon: Activity,
    card: "bg-warning/10 border-warning/20",
    icon_color: "text-warning",
  },
  system: {
    icon: Clock,
    card: "bg-muted border-border",
    icon_color: "text-muted-foreground",
  },
};

const AlertsScreen = ({
  role,
}: AlertsScreenProps) => {
  const {
    notifications,
    clearNotification,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const roleNotifs = notifications.filter(
    (notification) =>
      notification.roles.includes(role),
  );

  const unread = roleNotifs.filter(
    (notification) => !notification.read,
  );

  return (
    <MobileLayout role={role}>
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
          min-w-0
          overflow-x-hidden
          px-4
          pb-20
          pt-4
          sm:px-5
          lg:px-6
          lg:pb-6
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div
          className="
            mb-4
            flex
            min-w-0
            items-center
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <h1
              className="
                text-xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-2xl
              "
            >
              Alerts
            </h1>

            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              {unread.length > 0
                ? `${unread.length} unread`
                : "All caught up"}
            </p>
          </div>

          {unread.length > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="
                shrink-0
                rounded-lg
                px-2
                py-1.5
                text-[10px]
                font-semibold
                text-primary
                transition
                hover:bg-primary/10
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                sm:text-xs
              "
            >
              Mark all read
            </button>
          )}
        </div>

        {/* ============================================================
            EMPTY STATE
        ============================================================ */}

        {roleNotifs.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              flex
              min-h-[55dvh]
              flex-col
              items-center
              justify-center
              px-5
              text-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-muted
              "
            >
              <Bell className="h-6 w-6 text-muted-foreground/50" />
            </div>

            <p className="mt-4 text-sm font-bold text-foreground">
              No alerts
            </p>

            <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-muted-foreground sm:text-xs">
              Alerts will appear here when something
              needs your attention.
            </p>
          </motion.div>
        )}

        {/* ============================================================
            ALERT LIST
        ============================================================ */}

        {roleNotifs.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {roleNotifs.map(
                (notification, index) => {
                  const config =
                    typeConfig[
                    notification.type
                    ];

                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: notification.read
                          ? 0.62
                          : 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        height: 0,
                        marginBottom: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.03,
                      }}
                      onClick={() =>
                        markAsRead(
                          notification.id,
                        )
                      }
                      className={`
                        flex
                        min-w-0
                        cursor-pointer
                        items-center
                        gap-2.5
                        overflow-hidden
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        transition
                        ${config.card}
                      `}
                    >
                      {/* Icon */}

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-card
                        "
                      >
                        <Icon
                          className={`h-4 w-4 ${config.icon_color}`}
                        />
                      </div>

                      {/* Content */}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="min-w-0 flex-1 truncate text-xs font-semibold text-card-foreground sm:text-sm">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <span
                              className="
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-primary
                              "
                            />
                          )}
                        </div>

                        <p className="mt-0.5 line-clamp-2 break-words text-[10px] leading-4 text-muted-foreground sm:text-xs">
                          {notification.body}
                        </p>

                        <p className="mt-1 text-[8px] text-muted-foreground sm:text-[9px]">
                          {notification.time}
                        </p>
                      </div>

                      {/* Dismiss */}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          clearNotification(
                            notification.id,
                          );
                        }}
                        aria-label="Dismiss alert"
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-muted-foreground
                          transition
                          hover:bg-destructive/10
                          hover:text-destructive
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  );
                },
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ============================================================
            CLEAR ALL
        ============================================================ */}

        {roleNotifs.length > 0 && (
          <motion.button
            type="button"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
            }}
            onClick={() =>
              roleNotifs.forEach(
                (notification) =>
                  clearNotification(
                    notification.id,
                  ),
              )
            }
            className="
              mt-3
              flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-border
              text-[10px]
              font-semibold
              text-muted-foreground
              transition
              hover:border-destructive/30
              hover:bg-destructive/5
              hover:text-destructive
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:text-xs
            "
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </motion.button>
        )}
      </div>
    </MobileLayout>
  );
};

export default AlertsScreen;