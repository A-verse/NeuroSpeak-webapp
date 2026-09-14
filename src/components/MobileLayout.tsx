import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  MapPin,
  Bell,
  UserCircle,
  BarChart3,
  MessagesSquare,
  Moon,
  Sun,
  HeartPulse,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useApp } from "@/contexts/AppContext";
import { haptics } from "@/lib/haptics";

interface MobileLayoutProps {
  children: ReactNode;
  role: "user" | "caregiver";
}

const userTabs = [
  {
    path: "/user",
    icon: Home,
    label: "Home",
  },
  {
    path: "/user/communicate",
    icon: MessageSquare,
    label: "Talk",
  },
  {
    path: "/user/chat",
    icon: MessagesSquare,
    label: "Chat",
  },
  {
    path: "/user/tracking",
    icon: MapPin,
    label: "Track",
  },
  {
    path: "/user/profile",
    icon: UserCircle,
    label: "Profile",
  },
];

const caregiverTabs = [
  {
    path: "/caregiver",
    icon: Home,
    label: "Home",
  },
  {
    path: "/caregiver/tracking",
    icon: MapPin,
    label: "Track",
  },
  {
    path: "/caregiver/analysis",
    icon: BarChart3,
    label: "AI",
  },
  {
    path: "/caregiver/chat",
    icon: MessagesSquare,
    label: "Chat",
  },
  {
    path: "/caregiver/profile",
    icon: UserCircle,
    label: "Profile",
  },
];

const MobileLayout = ({
  children,
  role,
}: MobileLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    unreadCount,
    setShowPanel,
  } = useNotifications();

  const {
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const tabs =
    role === "caregiver"
      ? caregiverTabs
      : userTabs;

  const isActive = (path: string) => {
    if (
      path === "/user" ||
      path === "/caregiver"
    ) {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const navigateTo = (path: string) => {
    haptics.light();
    navigate(path);
  };

  return (
    <div
      className="
        relative
        flex
        min-h-[100dvh]
        w-full
        max-w-full
        min-w-0
        overflow-x-clip
        bg-background
        text-foreground
      "
    >
      {/* ================================================================
          DESKTOP SIDEBAR
          1024px and above
          ================================================================ */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-[220px]
          flex-col
          overflow-hidden
          border-r
          border-border
          bg-card
          lg:flex
        "
      >
        {/* Logo */}

        <div
          className="
            flex
            h-16
            shrink-0
            items-center
            gap-2.5
            border-b
            border-border
            px-4
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
              bg-primary
            "
          >
            <HeartPulse
              className="
                h-5
                w-5
                text-primary-foreground
              "
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              NeuroSpeak
            </p>

            <p className="truncate text-[9px] text-muted-foreground">
              {role === "caregiver"
                ? "Caregiver"
                : "Communication support"}
            </p>
          </div>
        </div>

        {/* Navigation */}

        <nav
          aria-label="Primary navigation"
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            px-2.5
            py-4
          "
        >
          <p
            className="
              mb-2
              px-2.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-muted-foreground
            "
          >
            Menu
          </p>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);

              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() =>
                    navigateTo(tab.path)
                  }
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={cn(
                    `
                      relative
                      flex
                      h-10
                      w-full
                      min-w-0
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      text-left
                      text-xs
                      font-medium
                      transition-colors
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    `,
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-5
                        w-0.5
                        -translate-y-1/2
                        rounded-full
                        bg-primary
                      "
                    />
                  )}

                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0",
                      active &&
                      "stroke-[2.5]",
                    )}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {tab.label}
                  </span>

                  {tab.label === "Chat" &&
                    unreadCount > 0 && (
                      <span
                        className="
                          flex
                          h-4
                          min-w-4
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-destructive
                          px-1
                          text-[8px]
                          font-bold
                          text-destructive-foreground
                        "
                      >
                        {unreadCount > 9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}
                </button>
              );
            })}
          </div>

          {/* Settings */}

          <p
            className="
              mb-2
              mt-7
              px-2.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-muted-foreground
            "
          >
            Preferences
          </p>

          <button
            type="button"
            onClick={() => {
              haptics.light();

              navigate(
                role === "caregiver"
                  ? "/caregiver/settings"
                  : "/user/settings",
              );
            }}
            className="
              flex
              h-10
              w-full
              min-w-0
              items-center
              gap-3
              rounded-lg
              px-3
              text-left
              text-xs
              font-medium
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            <Settings className="h-[17px] w-[17px] shrink-0" />

            <span className="truncate">
              Settings
            </span>
          </button>
        </nav>

        {/* Sidebar bottom */}

        <div
          className="
            shrink-0
            border-t
            border-border
            px-3
            py-3
          "
        >
          <button
            type="button"
            onClick={() => {
              haptics.light();
              toggleDarkMode();
            }}
            className="
              flex
              h-10
              w-full
              min-w-0
              items-center
              gap-3
              rounded-lg
              px-3
              text-left
              text-xs
              font-medium
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            {isDarkMode ? (
              <Sun className="h-[17px] w-[17px] shrink-0" />
            ) : (
              <Moon className="h-[17px] w-[17px] shrink-0" />
            )}

            <span className="truncate">
              {isDarkMode
                ? "Light mode"
                : "Dark mode"}
            </span>
          </button>
        </div>
      </aside>

      {/* ================================================================
          MAIN AREA
          ================================================================ */}

      <div
        className="
          flex
          min-h-[100dvh]
          w-full
          min-w-0
          max-w-full
          flex-1
          flex-col
          overflow-x-clip
          lg:ml-[220px]
          lg:w-[calc(100%-220px)]
        "
      >
        {/* ================================================================
            TOP RIGHT CONTROLS

            Same controls on mobile, tablet and desktop.
            ================================================================ */}

        <div
          className="
            fixed
            right-3
            top-[max(0.75rem,env(safe-area-inset-top))]
            z-50
            flex
            items-center
            gap-2
            sm:right-5
            lg:right-6
          "
        >
          {/* Theme */}

          <motion.button
            type="button"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={() => {
              haptics.light();
              toggleDarkMode();
            }}
            aria-label="Toggle dark mode"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-border
              bg-card
              shadow-card
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:h-10
              sm:w-10
            "
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-warning" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </motion.button>

          {/* Notifications */}

          <motion.button
            type="button"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={() => {
              haptics.light();
              setShowPanel(true);
            }}
            aria-label={`Notifications${unreadCount > 0
                ? `, ${unreadCount} unread`
                : ""
              }`}
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-border
              bg-card
              shadow-card
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:h-10
              sm:w-10
            "
          >
            <Bell className="h-4 w-4 text-foreground" />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-destructive
                  px-1
                  text-[8px]
                  font-bold
                  leading-none
                  text-destructive-foreground
                "
              >
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* ================================================================
            PAGE CONTENT

            IMPORTANT:
            width constraints here prevent child pages from
            creating horizontal overflow.
            ================================================================ */}

        <main
          className="
            app-main
            min-h-0
            w-full
            min-w-0
            max-w-full
            flex-1
            overflow-x-clip
            overflow-y-auto
            pb-[calc(5rem+env(safe-area-inset-bottom))]
            pt-2
            lg:pb-6
          "
        >
          <div
            className="
              w-full
              min-w-0
              max-w-full
              overflow-x-clip
            "
          >
            {children}
          </div>
        </main>

        {/* ================================================================
            MOBILE + TABLET BOTTOM NAV
            Hidden at 1024px+
            ================================================================ */}

        <nav
          aria-label="Primary navigation"
          className="
            fixed
            inset-x-0
            bottom-0
            z-50
            border-t
            border-border
            bg-card/95
            px-1
            pb-[max(0.5rem,env(safe-area-inset-bottom))]
            pt-1
            backdrop-blur-xl
            lg:hidden
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-full
              min-w-0
              max-w-md
              items-stretch
            "
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);

              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() =>
                    navigateTo(tab.path)
                  }
                  aria-label={tab.label}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={cn(
                    `
                      relative
                      flex
                      min-w-0
                      flex-1
                      flex-col
                      items-center
                      justify-center
                      gap-0.5
                      rounded-xl
                      px-1
                      py-1
                      transition-colors
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    `,
                    active
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        -top-1
                        h-0.5
                        w-5
                        rounded-full
                        bg-primary
                      "
                    />
                  )}

                  <span className="relative shrink-0">
                    <Icon
                      className={cn(
                        "h-[19px] w-[19px]",
                        active &&
                        "stroke-[2.5]",
                      )}
                    />

                    {tab.label === "Chat" &&
                      unreadCount > 0 && (
                        <span
                          className="
                            absolute
                            -right-2
                            -top-1
                            flex
                            h-3.5
                            min-w-3.5
                            items-center
                            justify-center
                            rounded-full
                            bg-destructive
                            px-0.5
                            text-[7px]
                            font-bold
                            leading-none
                            text-destructive-foreground
                          "
                        >
                          {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                        </span>
                      )}
                  </span>

                  <span
                    className={cn(
                      `
                        max-w-full
                        truncate
                        text-[9px]
                        leading-3
                        sm:text-[10px]
                      `,
                      active
                        ? "font-bold"
                        : "font-medium",
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileLayout;