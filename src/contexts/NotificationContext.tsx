import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, MessageSquare, Heart, Activity, X } from "lucide-react";
import { haptics } from "@/lib/haptics";

export interface Notification {
  id: string;
  type: "emergency" | "message" | "alert" | "health" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  /** Which role(s) should see this notification */
  roles: ("user" | "caregiver")[];
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "time" | "read"> & { roles?: ("user" | "caregiver")[] }) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// No initial/seed notifications — all notifications are generated from real user actions
// or received from Supabase Realtime (once the backend is connected).

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  emergency: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  message:   { icon: MessageSquare, color: "text-primary",     bg: "bg-primary/10"     },
  alert:     { icon: Activity,      color: "text-warning",     bg: "bg-warning/10"     },
  health:    { icon: Heart,         color: "text-destructive", bg: "bg-destructive/10" },
  system:    { icon: Bell,          color: "text-muted-foreground", bg: "bg-muted"     },
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read"> & { roles?: ("user" | "caregiver")[] }) => {
    const newNotif: Notification = {
      ...n,
      id: Date.now().toString(),
      time: "Just now",
      read: false,
      roles: n.roles || ["user", "caregiver"],
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (n.type === "emergency") {
      haptics.emergency();
    } else {
      haptics.notification();
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Called on logout — wipes all in-memory notification state
  const clearAll = useCallback(() => {
    setNotifications([]);
    setShowPanel(false);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead, clearNotification, clearAll, showPanel, setShowPanel }}
    >
      {children}

      {/* Notification Panel Overlay — bottom sheet */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[70] flex flex-col bg-card rounded-t-3xl shadow-elevated"
              style={{ maxHeight: "calc(80dvh - env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Header — always visible, never scrolled away */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-foreground">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Scrollable list
                  Bottom padding = bottom-nav height (5.5rem) + device safe-area.
                  This ensures the last notification is never hidden behind the nav bar.
              */}
              <div
                className="flex-1 overflow-y-auto px-5 py-3 space-y-2"
                style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
              >
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">You're all caught up.</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => {
                    const config = typeConfig[notif.type];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        layout
                        onClick={() => markAsRead(notif.id)}
                        className={`rounded-xl p-4 border flex items-start gap-3 transition-all cursor-pointer group ${
                          notif.read
                            ? "bg-card border-border opacity-70"
                            : `${config.bg} border-transparent`
                        }`}
                      >
                        <div className={`h-9 w-9 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold text-card-foreground ${!notif.read ? "" : "opacity-80"}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          aria-label="Dismiss notification"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
