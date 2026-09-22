import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Settings,
  LogOut,
  ChevronRight,
  Watch,
  Edit,
  Loader2,
} from "lucide-react";

interface ProfileScreenProps {
  role: "user" | "caregiver";
}

const ProfileScreen = ({
  role,
}: ProfileScreenProps) => {
  const {
    userName,
    userEmail,
    avatarUrl,
    logout,
    isSessionLoading,
  } = useApp();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    {
      label: "Edit Profile",
      icon: Edit,
      action: () =>
        navigate(`/${role}/edit-profile`),
    },
    {
      label: "Emergency Contacts",
      icon: Phone,
      action: () =>
        navigate(`/${role}/emergency-contacts`),
    },
    {
      label: "Wearable Devices",
      icon: Watch,
      action: () =>
        navigate("/wearable/setup"),
    },
    {
      label: "Settings",
      icon: Settings,
      action: () =>
        navigate(`/${role}/settings`),
    },
  ];

  const displayName =
    userName ||
    (isSessionLoading ? "" : "No name set");

  const initials = displayName
    ? displayName[0].toUpperCase()
    : "?";

  return (
    <MobileLayout role={role}>
      <div
        className="
          mx-auto
          w-full
          max-w-2xl
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

        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Profile
          </h1>

          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            Manage your account and preferences
          </p>
        </div>

        {/* ============================================================
            PROFILE CARD
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
          className="
            flex
            min-w-0
            items-center
            gap-3
            rounded-2xl
            border
            border-border
            bg-card
            p-3
            shadow-card
            sm:p-4
          "
        >
          {/* Avatar */}

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-gradient-primary
              sm:h-16
              sm:w-16
            "
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || "Profile"}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : isSessionLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
            ) : (
              <span
                className="
                  text-xl
                  font-bold
                  text-primary-foreground
                  sm:text-2xl
                "
              >
                {initials}
              </span>
            )}
          </div>

          {/* Identity */}

          <div className="min-w-0 flex-1">
            {isSessionLoading ? (
              <>
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />

                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
              </>
            ) : (
              <>
                <h2 className="truncate text-sm font-bold text-card-foreground sm:text-base">
                  {displayName || (
                    <span className="italic text-muted-foreground">
                      No name set
                    </span>
                  )}
                </h2>

                <p className="mt-0.5 text-[10px] capitalize text-muted-foreground sm:text-xs">
                  {role}
                </p>

                {userEmail && (
                  <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                    {userEmail}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Edit */}

          {!isSessionLoading && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/${role}/edit-profile`,
                )
              }
              aria-label="Edit profile"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
                text-primary
                transition
                hover:bg-primary/20
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
        </motion.div>

        {/* ============================================================
            ACCOUNT OPTIONS
        ============================================================ */}

        <div className="mt-4">
          <p className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {menuItems.map(
              (item, index) => {
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.05 +
                        index * 0.04,
                    }}
                    onClick={item.action}
                    className="
                      flex
                      min-h-[54px]
                      w-full
                      min-w-0
                      items-center
                      gap-3
                      border-b
                      border-border
                      px-3
                      text-left
                      transition
                      hover:bg-muted/50
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-ring
                      last:border-b-0
                      sm:min-h-[58px]
                      sm:px-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-primary/10
                      "
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-card-foreground sm:text-sm">
                      {item.label}
                    </span>

                    <ChevronRight
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-muted-foreground/50
                      "
                    />
                  </motion.button>
                );
              },
            )}
          </div>
        </div>

        {/* ============================================================
            LOG OUT
        ============================================================ */}

        <motion.button
          type="button"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.25,
          }}
          onClick={handleLogout}
          disabled={isSessionLoading}
          className="
            mt-4
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-destructive/15
            bg-destructive/5
            text-xs
            font-semibold
            text-destructive
            transition
            hover:bg-destructive/10
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-destructive
          "
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </motion.button>

        {/* ============================================================
            PROFILE SETUP HINT
        ============================================================ */}

        {!isSessionLoading &&
          !userName && (
            <p className="mt-3 text-center text-[9px] text-muted-foreground">
              Your profile name hasn't been set yet.{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/${role}/edit-profile`,
                  )
                }
                className="
                  font-medium
                  text-primary
                  underline
                  underline-offset-2
                "
              >
                Set it up
              </button>
            </p>
          )}
      </div>
    </MobileLayout>
  );
};

export default ProfileScreen;