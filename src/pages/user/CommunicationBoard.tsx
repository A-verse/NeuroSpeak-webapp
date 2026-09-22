import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import {
  UtensilsCrossed,
  Droplets,
  Moon,
  Heart,
  Bath,
  Smile,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Plus,
  Square,
  AlertCircle,
  Mic,
  ChevronRight,
} from "lucide-react";
import { haptics } from "@/lib/haptics";
import { useTTS } from "@/hooks/useTTS";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const defaultCategories = [
  {
    id: "food",
    label: "Food",
    icon: UtensilsCrossed,
    messages: [
      "I am hungry",
      "I want a snack",
      "I want lunch",
      "I want dinner",
      "I want breakfast",
    ],
  },
  {
    id: "water",
    label: "Water",
    icon: Droplets,
    messages: [
      "I need water",
      "I want juice",
      "I want milk",
      "I am thirsty",
    ],
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: Moon,
    messages: [
      "I am tired",
      "I want to sleep",
      "I need rest",
      "I can't sleep",
    ],
  },
  {
    id: "emotion",
    label: "Emotion",
    icon: Heart,
    messages: [
      "I am happy",
      "I am sad",
      "I am scared",
      "I feel lonely",
      "I feel anxious",
    ],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    icon: Bath,
    messages: [
      "I need bathroom",
      "I need help cleaning",
      "I need a shower",
    ],
  },
  {
    id: "mood",
    label: "Mood",
    icon: Smile,
    messages: [
      "I feel good",
      "I feel sick",
      "I am bored",
      "I am uncomfortable",
      "I feel pain",
    ],
  },
];

function getSmartSuggestions(): {
  phrase: string;
  reason: string;
}[] {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 10) {
    return [
      {
        phrase: "I want breakfast",
        reason: "Morning",
      },
      {
        phrase: "I need water",
        reason: "Hydration",
      },
      {
        phrase: "I am tired",
        reason: "Rest",
      },
    ];
  }

  if (hour >= 10 && hour < 14) {
    return [
      {
        phrase: "I want lunch",
        reason: "Lunch",
      },
      {
        phrase: "I am thirsty",
        reason: "Hydration",
      },
      {
        phrase: "I need bathroom",
        reason: "Need",
      },
    ];
  }

  if (hour >= 14 && hour < 18) {
    return [
      {
        phrase: "I want a snack",
        reason: "Afternoon",
      },
      {
        phrase: "I am bored",
        reason: "Mood",
      },
      {
        phrase: "I need water",
        reason: "Hydration",
      },
    ];
  }

  if (hour >= 18 && hour < 22) {
    return [
      {
        phrase: "I want dinner",
        reason: "Evening",
      },
      {
        phrase: "I am tired",
        reason: "Rest",
      },
      {
        phrase: "I feel good",
        reason: "Check-in",
      },
    ];
  }

  return [
    {
      phrase: "I can't sleep",
      reason: "Night",
    },
    {
      phrase: "I need water",
      reason: "Hydration",
    },
    {
      phrase: "I need help cleaning",
      reason: "Need",
    },
  ];
}

const CUSTOM_PHRASES_KEY =
  "neurospeak_custom_phrases";

interface CustomPhrase {
  id: number;
  text: string;
  icon: string;
  category: string;
}

const CommunicationBoard = () => {
  const [selected, setSelected] =
    useState<string | null>(null);

  const [customPhrases, setCustomPhrases] =
    useState<CustomPhrase[]>([]);

  const [typeText, setTypeText] = useState("");

  const navigate = useNavigate();

  const suggestions = useMemo(
    () => getSmartSuggestions(),
    [],
  );

  const { speechRate } = useApp();

  const tts = useTTS({
    rate: speechRate,
  });

  const typeInputRef =
    useRef<HTMLTextAreaElement>(null);

  /* ------------------------------------------------------------------------
     Load custom phrases
     ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        CUSTOM_PHRASES_KEY,
      );

      if (stored) {
        setCustomPhrases(JSON.parse(stored));
      }
    } catch {
      setCustomPhrases([]);
    }
  }, []);

  /* ------------------------------------------------------------------------
     Categories
     ------------------------------------------------------------------------ */

  const categories = useMemo(() => {
    if (customPhrases.length === 0) {
      return defaultCategories;
    }

    return [
      ...defaultCategories,
      {
        id: "custom",
        label: "My Phrases",
        icon: Sparkles,
        messages: customPhrases.map(
          (phrase) => phrase.text,
        ),
      },
    ];
  }, [customPhrases]);

  const activeCategory = categories.find(
    (category) => category.id === selected,
  );

  /* ------------------------------------------------------------------------
     Speak
     ------------------------------------------------------------------------ */

  const handleSpeak = (phrase: string) => {
    const text = phrase.trim();

    if (!text) return;

    haptics.medium();
    tts.speak(text);
  };

  const handleStopSpeaking = () => {
    haptics.light();
    tts.stop();
  };

  const handleTypedSpeak = () => {
    const text = typeText.trim();

    if (!text || !tts.isSupported) return;

    haptics.medium();
    tts.speak(text);
  };

  const handleCategory = (id: string) => {
    haptics.light();
    tts.stop();
    setSelected(id);
  };

  const handleBack = () => {
    haptics.light();
    tts.stop();
    setSelected(null);
  };

  return (
    <MobileLayout role="user">
      <div
        className="
          mx-auto
          w-full
          min-w-0
          max-w-3xl
          overflow-x-hidden
          px-4
          pb-20
          pt-4
          sm:px-5
          sm:pt-5
          lg:px-6
        "
      >
        <AnimatePresence mode="wait">
          {/* ==================================================================
              CATEGORY HOME
              ================================================================== */}

          {!selected ? (
            <motion.div
              key="communication-home"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="min-w-0"
            >
              {/* Header */}

              <div
                className="
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
                      truncate
                      text-xl
                      font-bold
                      tracking-tight
                      text-foreground
                      sm:text-2xl
                    "
                  >
                    Communicate
                  </h1>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-muted-foreground
                      sm:text-sm
                    "
                  >
                    Choose what you want to say
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.92,
                  }}
                  onClick={() => {
                    haptics.light();
                    navigate(
                      "/user/custom-phrases",
                    );
                  }}
                  aria-label="Manage custom phrases"
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-primary
                    shadow-card
                  "
                >
                  <Plus
                    className="
                      h-4
                      w-4
                      text-primary-foreground
                    "
                  />
                </motion.button>
              </div>

              {/* ==============================================================
                  TYPE & SPEAK
                  ============================================================== */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="
                  mt-4
                  min-w-0
                  rounded-2xl
                  border
                  border-border
                  bg-card
                  p-3
                  shadow-card
                  sm:p-4
                "
              >
                <div
                  className="
                    mb-2
                    flex
                    min-w-0
                    items-center
                    gap-2
                  "
                >
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-primary/10
                    "
                  >
                    <Mic
                      className="
                        h-3.5
                        w-3.5
                        text-primary
                      "
                    />
                  </div>

                  <span
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-xs
                      font-bold
                      text-foreground
                      sm:text-sm
                    "
                  >
                    Type &amp; Speak
                  </span>

                  {!tts.isSupported && (
                    <span
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                        text-[9px]
                        font-medium
                        text-warning
                      "
                    >
                      <AlertCircle className="h-3 w-3" />
                      Unsupported
                    </span>
                  )}
                </div>

                <textarea
                  ref={typeInputRef}
                  rows={2}
                  value={typeText}
                  onChange={(event) =>
                    setTypeText(event.target.value)
                  }
                  placeholder={
                    tts.isSupported
                      ? "Type anything to speak aloud..."
                      : "Text-to-speech is not available"
                  }
                  disabled={!tts.isSupported}
                  aria-label="Type text to speak"
                  className="
                    block
                    min-h-[64px]
                    w-full
                    min-w-0
                    resize-none
                    overflow-y-auto
                    rounded-xl
                    border
                    border-border
                    bg-muted
                    px-3
                    py-2.5
                    text-xs
                    leading-5
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-1
                    focus:ring-primary/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:text-sm
                  "
                />

                <div
                  className="
                    mt-2
                    flex
                    min-w-0
                    gap-2
                  "
                >
                  {tts.isSpeaking && (
                    <motion.button
                      type="button"
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      onClick={
                        handleStopSpeaking
                      }
                      className="
                        flex
                        h-10
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-xl
                        bg-destructive/10
                        px-3
                        text-xs
                        font-semibold
                        text-destructive
                      "
                    >
                      <Square
                        className="
                          h-3
                          w-3
                          fill-current
                        "
                      />
                      Stop
                    </motion.button>
                  )}

                  <button
                    type="button"
                    onClick={handleTypedSpeak}
                    disabled={
                      !typeText.trim() ||
                      !tts.isSupported
                    }
                    className="
                      flex
                      h-10
                      min-w-0
                      flex-1
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      bg-gradient-primary
                      px-3
                      text-xs
                      font-bold
                      text-primary-foreground
                      transition
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      sm:text-sm
                    "
                  >
                    {tts.isSpeaking ? (
                      <>
                        <motion.span
                          animate={{
                            opacity: [1, 0.4, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                          }}
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >
                          <Volume2 className="h-4 w-4" />
                          Speaking...
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Speak
                      </>
                    )}
                  </button>
                </div>
              </motion.section>

              {/* ==============================================================
                  SMART SUGGESTIONS
                  ============================================================== */}

              <section className="mt-4 min-w-0">
                <div
                  className="
                    mb-2
                    flex
                    min-w-0
                    items-center
                    gap-2
                  "
                >
                  <Sparkles
                    className="
                      h-3.5
                      w-3.5
                      shrink-0
                      text-primary
                    "
                  />

                  <h2
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-xs
                      font-bold
                      text-foreground
                      sm:text-sm
                    "
                  >
                    Suggested
                  </h2>

                  <span
                    className="
                      shrink-0
                      text-[9px]
                      text-muted-foreground
                    "
                  >
                    Based on time
                  </span>
                </div>

                <div
                  className="
                    grid
                    min-w-0
                    grid-cols-1
                    gap-2
                    sm:grid-cols-3
                  "
                >
                  {suggestions.map(
                    (suggestion, index) => (
                      <motion.button
                        key={suggestion.phrase}
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.04,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        onClick={() =>
                          handleSpeak(
                            suggestion.phrase,
                          )
                        }
                        className="
                          flex
                          min-h-11
                          min-w-0
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-primary/15
                          bg-primary/5
                          px-3
                          text-left
                          transition
                          hover:border-primary/30
                        "
                      >
                        <Volume2
                          className="
                            h-3.5
                            w-3.5
                            shrink-0
                            text-primary
                          "
                        />

                        <span
                          className="
                            min-w-0
                            flex-1
                            truncate
                            text-[11px]
                            font-semibold
                            text-foreground
                          "
                        >
                          {suggestion.phrase}
                        </span>

                        <span
                          className="
                            hidden
                            shrink-0
                            rounded-full
                            bg-card
                            px-1.5
                            py-0.5
                            text-[8px]
                            text-muted-foreground
                            sm:block
                          "
                        >
                          {suggestion.reason}
                        </span>
                      </motion.button>
                    ),
                  )}
                </div>
              </section>

              {/* ==============================================================
                  CATEGORIES
                  ============================================================== */}

              <section className="mt-5 min-w-0">
                <div className="mb-2">
                  <h2
                    className="
                      text-xs
                      font-bold
                      text-foreground
                      sm:text-sm
                    "
                  >
                    Categories
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    Browse common phrases
                  </p>
                </div>

                <div
                  className="
                    grid
                    min-w-0
                    grid-cols-2
                    gap-2.5
                    sm:grid-cols-3
                  "
                >
                  {categories.map(
                    (category, index) => {
                      const Icon = category.icon;
                      const isCustom =
                        category.id === "custom";

                      return (
                        <motion.button
                          key={category.id}
                          type="button"
                          initial={{
                            opacity: 0,
                            y: 6,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              0.08 +
                              index * 0.035,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() =>
                            handleCategory(
                              category.id,
                            )
                          }
                          className={cn(
                            `
                              flex
                              h-[76px]
                              min-w-0
                              items-center
                              gap-2.5
                              overflow-hidden
                              rounded-xl
                              border
                              bg-card
                              px-3
                              text-left
                              shadow-card
                              transition
                              hover:border-primary/30
                              hover:shadow-elevated
                            `,
                            isCustom
                              ? "border-primary/30 bg-primary/5"
                              : "border-border",
                          )}
                        >
                          <div
                            className={cn(
                              `
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                              `,
                              isCustom
                                ? "bg-primary"
                                : "bg-primary/10",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                isCustom
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="
                                truncate
                                text-[11px]
                                font-bold
                                text-card-foreground
                                sm:text-xs
                              "
                            >
                              {category.label}
                            </p>

                            <p
                              className="
                                mt-0.5
                                truncate
                                text-[9px]
                                text-muted-foreground
                              "
                            >
                              {category.messages.length}{" "}
                              phrases
                            </p>
                          </div>

                          <ChevronRight
                            className="
                              h-3.5
                              w-3.5
                              shrink-0
                              text-muted-foreground/40
                            "
                          />
                        </motion.button>
                      );
                    },
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            /* ================================================================
               PHRASE LIST
               ================================================================ */

            <motion.div
              key="communication-messages"
              initial={{
                opacity: 0,
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -12,
              }}
              className="min-w-0"
            >
              {/* Back */}

              <button
                type="button"
                onClick={handleBack}
                className="
                  flex
                  min-h-9
                  items-center
                  gap-1.5
                  rounded-lg
                  text-xs
                  font-semibold
                  text-primary
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {/* Header */}

              <div
                className="
                  mt-3
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
                      truncate
                      text-xl
                      font-bold
                      tracking-tight
                      text-foreground
                      sm:text-2xl
                    "
                  >
                    {activeCategory?.label}
                  </h1>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    Tap a phrase to speak
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {tts.isSpeaking && (
                    <button
                      type="button"
                      onClick={
                        handleStopSpeaking
                      }
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-lg
                        bg-destructive/10
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-semibold
                        text-destructive
                      "
                    >
                      <VolumeX className="h-3 w-3" />
                      Stop
                    </button>
                  )}

                  {selected === "custom" && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/user/custom-phrases",
                        )
                      }
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-lg
                        bg-primary/10
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-semibold
                        text-primary
                      "
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Phrase buttons */}

              <div
                className="
                  mt-4
                  grid
                  min-w-0
                  grid-cols-1
                  gap-2
                  sm:grid-cols-2
                "
              >
                {activeCategory?.messages.map(
                  (message, index) => (
                    <motion.button
                      key={`${message}-${index}`}
                      type="button"
                      initial={{
                        opacity: 0,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.035,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() =>
                        handleSpeak(message)
                      }
                      className="
                        flex
                        min-h-[62px]
                        w-full
                        min-w-0
                        items-center
                        gap-3
                        overflow-hidden
                        rounded-xl
                        border
                        border-border
                        bg-card
                        px-3.5
                        text-left
                        shadow-card
                        transition
                        hover:border-primary/30
                        hover:shadow-elevated
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-ring
                        sm:min-h-[68px]
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
                          rounded-full
                          bg-primary/10
                        "
                      >
                        <Volume2
                          className="
                            h-4
                            w-4
                            text-primary
                          "
                        />
                      </div>

                      <span
                        className="
                          min-w-0
                          flex-1
                          truncate
                          text-xs
                          font-semibold
                          text-card-foreground
                          sm:text-sm
                        "
                      >
                        {message}
                      </span>

                      <ChevronRight
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-muted-foreground/40
                        "
                      />
                    </motion.button>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
};

export default CommunicationBoard;