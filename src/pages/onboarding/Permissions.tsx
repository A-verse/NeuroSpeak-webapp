import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  MapPin,
  Mic,
  Check,
  ShieldCheck,
} from "lucide-react";

const permissions = [
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    desc: "Alerts and important updates",
  },
  {
    id: "location",
    icon: MapPin,
    title: "Location",
    desc: "Location sharing for safety features",
  },
  {
    id: "microphone",
    icon: Mic,
    title: "Microphone",
    desc: "Voice communication and calls",
  },
];

const Permissions = () => {
  const navigate = useNavigate();

  const [selected, setSelected] =
    useState<string[]>([]);

  const togglePermission = (
    id: string,
  ) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
          (item) => item !== id,
        )
        : [...prev, id],
    );
  };

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
              Step 1 of 3
            </p>

            <span className="text-[9px] text-muted-foreground sm:text-[10px]">
              Permissions
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
            Set up access
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Choose the device features NeuroSpeak can use.
          </p>
        </motion.div>

        {/* ============================================================
            PERMISSIONS
        ============================================================ */}

        <div
          className="
            mt-5
            min-h-0
            flex-1
            overflow-y-auto
            pb-3
          "
        >
          <div className="space-y-2.5">
            {permissions.map(
              (permission, index) => {
                const isSelected =
                  selected.includes(
                    permission.id,
                  );

                const Icon =
                  permission.icon;

                return (
                  <motion.button
                    key={permission.id}
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
                        index * 0.07,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={() =>
                      togglePermission(
                        permission.id,
                      )
                    }
                    className={`
                      relative
                      flex
                      min-h-[76px]
                      w-full
                      min-w-0
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      sm:min-h-[82px]
                      sm:px-4
                      ${isSelected
                        ? "border-primary bg-primary/10 shadow-card"
                        : "border-border bg-card shadow-card hover:border-primary/30"
                      }
                    `}
                  >
                    {/* Icon */}

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        transition-colors
                        ${isSelected
                          ? "bg-primary"
                          : "bg-muted"
                        }
                      `}
                    >
                      {isSelected ? (
                        <Check className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Text */}

                    <div className="min-w-0 flex-1 pr-5">
                      <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                        {permission.title}
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                        {permission.desc}
                      </p>
                    </div>

                    {/* Status */}

                    <div
                      className={`
                        absolute
                        right-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        rounded-full
                        border
                        transition-all
                        ${isSelected
                          ? "border-primary bg-primary"
                          : "border-border bg-background"
                        }
                      `}
                    >
                      {isSelected && (
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      )}
                    </div>
                  </motion.button>
                );
              },
            )}
          </div>

          {/* ============================================================
              PRIVACY NOTE
          ============================================================ */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="
              mt-3
              flex
              min-w-0
              items-start
              gap-2.5
              rounded-2xl
              border
              border-primary/15
              bg-primary/5
              px-3
              py-2.5
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
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-card-foreground sm:text-xs">
                You stay in control
              </p>

              <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground sm:text-[9px]">
                You can change device permissions anytime from your
                device settings.
              </p>
            </div>
          </motion.div>

          <p className="mt-2 text-center text-[9px] text-muted-foreground">
            {selected.length} of{" "}
            {permissions.length} selected
          </p>
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
            delay: 0.35,
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
                "/onboarding/accessibility",
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

          {/* Progress */}

          <div className="mt-2 flex justify-center gap-1">
            <span className="h-1 w-5 rounded-full bg-primary" />
            <span className="h-1 w-5 rounded-full bg-muted" />
            <span className="h-1 w-5 rounded-full bg-muted" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Permissions;