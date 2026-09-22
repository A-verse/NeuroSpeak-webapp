import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Heart,
  MessageSquare,
  X,
} from "lucide-react";

import { useNotifications } from "@/contexts/NotificationContext";

const iconMap: Record<string, typeof Bell> = {
  emergency: AlertTriangle,
  message: MessageSquare,
  alert: Activity,
  health: Heart,
  system: Bell,
};

const colorMap: Record<string, string> = {
  emergency: "bg-destructive text-destructive-foreground",
  message: "bg-primary text-primary-foreground",
  alert: "bg-warning text-warning-foreground",
  health: "bg-destructive text-destructive-foreground",
  system: "bg-muted text-foreground",
};

const NotificationToast = () => {
  const { notifications, markAsRead } = useNotifications();

  const latestUnread = notifications.find(
    (notification) => !notification.read && notification.time === "Just now"
  );

  useEffect(() => {
    if (!latestUnread) return;

    const notificationId = latestUnread.id;

    const timer = window.setTimeout(() => {
      markAsRead(notificationId);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [latestUnread?.id, markAsRead]);

  return (
    <div className="pointer-events-none fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[100] w-full max-w-[460px] -translate-x-1/2 px-4">
      <AnimatePresence mode="wait">
        {latestUnread && (
          <motion.div
            key={latestUnread.id}
            initial={{ opacity: 0, y: -32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 300,
            }}
            className="pointer-events-auto"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/95 p-3.5 shadow-elevated backdrop-blur-xl">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorMap[latestUnread.type] ?? colorMap.system
                  }`}
              >
                {(() => {
                  const Icon =
                    iconMap[latestUnread.type] ?? iconMap.system;

                  return <Icon className="h-5 w-5" />;
                })()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-card-foreground">
                  {latestUnread.title}
                </p>

                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {latestUnread.body}
                </p>
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => markAsRead(latestUnread.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;