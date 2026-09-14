import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import {
  Type,
  Moon,
  Eye,
  Check,
} from "lucide-react";

const AccessibilitySetup = () => {
  const navigate = useNavigate();

  const {
    textSize,
    setTextSize,
    isDarkMode,
    toggleDarkMode,
    highContrast,
    setHighContrast,
  } = useApp();

  return (
    <div
      className="
        flex
        h-[100dvh]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-x-hidden
        bg-background
        px-4
        py-4
        sm:px-6
        sm:py-6
      "
    >
      <div
        className="
          mx-auto
          flex
          h-full
          min-h-0
          w-full
          max-w-xl
          flex-col
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
          className="shrink-0"
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
              Step 2 of 3
            </p>

            <span className="text-[9px] text-muted-foreground sm:text-[10px]">
              Accessibility
            </span>
          </div>

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >
            Make it comfortable
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Customize NeuroSpeak for your needs.
          </p>
        </motion.div>

        {/* ============================================================
            SETTINGS
        ============================================================ */}

        <div
          className="
            mt-5
            min-h-0
            flex-1
            space-y-2.5
            overflow-y-auto
            pb-3
          "
        >
          {/* ========================================================
              TEXT SIZE
          ======================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
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
              p-3
              shadow-card
              sm:p-4
            "
          >
            <div className="mb-3 flex items-center gap-2.5">
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
                <Type className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xs font-semibold text-card-foreground sm:text-sm">
                  Text Size
                </h2>

                <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                  Choose what feels easiest to read
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  "normal",
                  "large",
                  "extra-large",
                ] as const
              ).map((size) => {
                const selected =
                  textSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setTextSize(size)
                    }
                    className={`
                      relative
                      rounded-xl
                      border
                      px-2
                      py-2.5
                      text-center
                      transition-all
                      ${selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40"
                      }
                    `}
                  >
                    {selected && (
                      <span
                        className="
                          absolute
                          right-1.5
                          top-1.5
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-primary
                        "
                      >
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </span>
                    )}

                    <span
                      className={`
                        block
                        font-semibold
                        ${size ===
                          "extra-large"
                          ? "text-xl"
                          : size ===
                            "large"
                            ? "text-lg"
                            : "text-base"
                        }
                      `}
                    >
                      {size ===
                        "extra-large"
                        ? "XL"
                        : size === "large"
                          ? "L"
                          : "M"}
                    </span>

                    <span className="mt-0.5 block text-[8px] capitalize sm:text-[9px]">
                      {size.replace(
                        "-",
                        " ",
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* ========================================================
              DARK MODE
          ======================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="
              rounded-2xl
              border
              border-border
              bg-card
              shadow-card
            "
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className="
                flex
                min-h-[66px]
                w-full
                items-center
                gap-3
                px-3
                text-left
                transition
                hover:bg-muted/30
                sm:px-4
              "
            >
              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${isDarkMode
                    ? "bg-primary"
                    : "bg-primary/10"
                  }
                `}
              >
                <Moon
                  className={`
                    h-4 w-4
                    ${isDarkMode
                      ? "text-primary-foreground"
                      : "text-primary"
                    }
                  `}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                  Dark Mode
                </p>

                <p className="mt-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                  Easier on the eyes in low light
                </p>
              </div>

              <Toggle
                enabled={isDarkMode}
              />
            </button>
          </motion.section>

          {/* ========================================================
              HIGH CONTRAST
          ======================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.22,
            }}
            className="
              rounded-2xl
              border
              border-border
              bg-card
              shadow-card
            "
          >
            <button
              type="button"
              onClick={() =>
                setHighContrast(
                  !highContrast,
                )
              }
              className="
                flex
                min-h-[66px]
                w-full
                items-center
                gap-3
                px-3
                text-left
                transition
                hover:bg-muted/30
                sm:px-4
              "
            >
              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${highContrast
                    ? "bg-primary"
                    : "bg-primary/10"
                  }
                `}
              >
                <Eye
                  className={`
                    h-4 w-4
                    ${highContrast
                      ? "text-primary-foreground"
                      : "text-primary"
                    }
                  `}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                  High Contrast
                </p>

                <p className="mt-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                  Increase visibility and clarity
                </p>
              </div>

              <Toggle
                enabled={highContrast}
              />
            </button>
          </motion.section>

          {/* ========================================================
              PREVIEW
          ======================================================== */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="
              rounded-2xl
              border
              border-primary/15
              bg-primary/5
              px-3
              py-2.5
              sm:px-4
            "
          >
            <p className="text-[9px] font-medium text-primary sm:text-[10px]">
              Your preferences can be changed anytime
            </p>

            <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground sm:text-[9px]">
              You can update these settings later from your profile.
            </p>
          </motion.div>
        </div>

        {/* ============================================================
            CONTINUE
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
            delay: 0.32,
          }}
          className="
            shrink-0
            border-t
            border-border
            bg-background
            pt-3
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/onboarding/communication",
              )
            }
            className="
              h-12
              w-full
              rounded-xl
              bg-gradient-primary
              text-sm
              font-semibold
              text-primary-foreground
              shadow-card
              transition
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:h-13
              sm:text-base
            "
          >
            Continue
          </button>

          <div className="mt-2 flex justify-center gap-1">
            <span className="h-1 w-5 rounded-full bg-muted" />
            <span className="h-1 w-5 rounded-full bg-primary" />
            <span className="h-1 w-5 rounded-full bg-muted" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ================================================================
   TOGGLE
================================================================ */

const Toggle = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  return (
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
      aria-hidden="true"
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
  );
};

export default AccessibilitySetup;