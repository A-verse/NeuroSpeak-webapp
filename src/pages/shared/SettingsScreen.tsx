import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import {
  Moon,
  Type,
  Eye,
  Bell,
  Globe,
  Brain,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface SettingsScreenProps {
  role: "user" | "caregiver";
}

const SettingsScreen = ({
  role,
}: SettingsScreenProps) => {
  const {
    isDarkMode,
    toggleDarkMode,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
  } = useApp();

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
          <h1
            className="
              text-xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-2xl
            "
          >
            Settings
          </h1>

          <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
            Personalize your NeuroSpeak experience
          </p>
        </div>

        {/* ============================================================
            ACCESSIBILITY
        ============================================================ */}

        <SectionLabel>
          Accessibility
        </SectionLabel>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          {/* Dark Mode */}

          <SettingToggle
            icon={Moon}
            label="Dark Mode"
            description="Use a darker appearance"
            enabled={isDarkMode}
            onClick={toggleDarkMode}
          />

          {/* Text Size */}

          <div
            className="
              border-t
              border-border
              px-3
              py-3
              sm:px-4
            "
          >
            <div className="mb-2 flex items-center gap-2.5">
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
                <Type className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                  Text Size
                </p>

                <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                  Adjust reading size
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  "normal",
                  "large",
                  "extra-large",
                ] as const
              ).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setTextSize(size)
                  }
                  className={`
                    rounded-lg
                    py-2
                    text-[10px]
                    font-semibold
                    transition-all
                    sm:text-xs
                    ${textSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {size ===
                    "extra-large"
                    ? "XL"
                    : size === "large"
                      ? "L"
                      : "M"}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}

          <div className="border-t border-border">
            <SettingToggle
              icon={Eye}
              label="High Contrast"
              description="Increase visual contrast"
              enabled={highContrast}
              onClick={() =>
                setHighContrast(
                  !highContrast,
                )
              }
            />
          </div>
        </div>

        {/* ============================================================
            PREFERENCES
        ============================================================ */}

        <SectionLabel>
          Preferences
        </SectionLabel>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          <PreferenceRow
            icon={Bell}
            label="Notifications"
            value="Enabled"
            disabled
          />

          <PreferenceRow
            icon={Globe}
            label="Language"
            value="English"
            disabled
          />

          <PreferenceRow
            icon={Brain}
            label="AI Sensitivity"
            value="Medium"
            disabled
            last
          />
        </div>

        {/* ============================================================
            NOTE
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mt-3
            rounded-xl
            border
            border-border
            bg-muted/40
            px-3
            py-2.5
          "
        >
          <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
            More preferences will become available as their
            backend services are connected.
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

/* ================================================================
   SECTION LABEL
================================================================ */

const SectionLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <p
      className="
        mb-2
        mt-4
        px-1
        text-[9px]
        font-semibold
        uppercase
        tracking-wider
        text-muted-foreground
      "
    >
      {children}
    </p>
  );
};

/* ================================================================
   TOGGLE ROW
================================================================ */

interface SettingToggleProps {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}

const SettingToggle = ({
  icon: Icon,
  label,
  description,
  enabled,
  onClick,
}: SettingToggleProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        min-h-[58px]
        w-full
        items-center
        gap-2.5
        px-3
        text-left
        transition
        hover:bg-muted/40
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

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-card-foreground sm:text-sm">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
          {description}
        </p>
      </div>

      <div
        className={`
          relative
          h-5
          w-10
          shrink-0
          rounded-full
          transition-colors
          ${enabled
            ? "bg-primary"
            : "bg-muted"
          }
        `}
      >
        <div
          className={`
            absolute
            top-0.5
            h-4
            w-4
            rounded-full
            bg-card
            shadow
            transition-transform
            ${enabled
              ? "translate-x-5"
              : "translate-x-0.5"
            }
          `}
        />
      </div>
    </button>
  );
};

/* ================================================================
   PREFERENCE ROW
================================================================ */

interface PreferenceRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  disabled?: boolean;
  last?: boolean;
}

const PreferenceRow = ({
  icon: Icon,
  label,
  value,
  disabled = false,
  last = false,
}: PreferenceRowProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        flex
        min-h-[54px]
        w-full
        items-center
        gap-2.5
        px-3
        text-left
        sm:px-4
        ${!last
          ? "border-b border-border"
          : ""
        }
        ${disabled
          ? "cursor-default"
          : "transition hover:bg-muted/40"
        }
      `}
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
        {label}
      </span>

      <span className="shrink-0 text-[9px] text-muted-foreground sm:text-xs">
        {value}
      </span>

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
    </button>
  );
};

export default SettingsScreen;