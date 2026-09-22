import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import {
  UtensilsCrossed,
  Droplets,
  Moon,
  Heart,
  Bath,
  Smile,
  Plus,
  Check,
} from "lucide-react";

const defaultPhrases = [
  {
    id: "food",
    icon: UtensilsCrossed,
    label: "Food & Meals",
  },
  {
    id: "water",
    icon: Droplets,
    label: "Drinks",
  },
  {
    id: "sleep",
    icon: Moon,
    label: "Sleep & Rest",
  },
  {
    id: "emotion",
    icon: Heart,
    label: "Emotions",
  },
  {
    id: "bathroom",
    icon: Bath,
    label: "Bathroom",
  },
  {
    id: "mood",
    icon: Smile,
    label: "Mood",
  },
];

const CommunicationPreferences = () => {
  const navigate = useNavigate();

  const {
    role,
    setOnboardingComplete,
  } = useApp();

  const [selected, setSelected] =
    useState<string[]>(
      defaultPhrases.map(
        (phrase) => phrase.id,
      ),
    );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
          (item) => item !== id,
        )
        : [...prev, id],
    );
  };

  const handleFinish = () => {
    setOnboardingComplete(true);

    navigate(
      role === "caregiver"
        ? "/caregiver"
        : "/user",
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
              Step 3 of 3
            </p>

            <span className="text-[9px] text-muted-foreground sm:text-[10px]">
              Communication
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
            Build your board
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Choose the communication categories you use most.
          </p>
        </motion.div>

        {/* ============================================================
            CATEGORY GRID
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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {defaultPhrases.map(
              (phrase, index) => {
                const isSelected =
                  selected.includes(
                    phrase.id,
                  );

                const Icon =
                  phrase.icon;

                return (
                  <motion.button
                    key={phrase.id}
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
                        index * 0.05,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() =>
                      toggle(
                        phrase.id,
                      )
                    }
                    className={`
                      relative
                      flex
                      min-h-[104px]
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      px-2
                      py-3
                      text-center
                      transition-all
                      sm:min-h-[118px]
                      ${isSelected
                        ? "border-primary bg-primary/10 shadow-card"
                        : "border-border bg-card shadow-card hover:border-primary/30"
                      }
                    `}
                  >
                    {/* Selection indicator */}

                    {isSelected && (
                      <span
                        className="
                          absolute
                          right-2
                          top-2
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-primary
                        "
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </span>
                    )}

                    {/* Icon */}

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        transition-colors
                        sm:h-11
                        sm:w-11
                        ${isSelected
                          ? "bg-primary"
                          : "bg-muted"
                        }
                      `}
                    >
                      {isSelected ? (
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Label */}

                    <span
                      className={`
                        text-[10px]
                        font-semibold
                        leading-tight
                        sm:text-xs
                        ${isSelected
                          ? "text-primary"
                          : "text-card-foreground"
                        }
                      `}
                    >
                      {phrase.label}
                    </span>
                  </motion.button>
                );
              },
            )}
          </div>

          {/* ========================================================
              CUSTOM PHRASES
          ======================================================== */}

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
              delay: 0.35,
            }}
            className="
              mt-3
              flex
              min-w-0
              items-center
              gap-2.5
              rounded-2xl
              border
              border-border
              bg-muted/40
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
              <Plus className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-card-foreground sm:text-xs">
                Custom phrases
              </p>

              <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground sm:text-[9px]">
                Add personalized phrases later from Communication.
              </p>
            </div>
          </motion.div>

          {/* Selected count */}

          <p className="mt-2 text-center text-[9px] text-muted-foreground">
            {selected.length} of{" "}
            {defaultPhrases.length} categories selected
          </p>
        </div>

        {/* ============================================================
            FINISH
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
            delay: 0.4,
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
            onClick={handleFinish}
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
            Finish Setup
          </button>

          {/* Progress */}

          <div className="mt-2 flex justify-center gap-1">
            <span className="h-1 w-5 rounded-full bg-muted" />
            <span className="h-1 w-5 rounded-full bg-muted" />
            <span className="h-1 w-5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunicationPreferences;