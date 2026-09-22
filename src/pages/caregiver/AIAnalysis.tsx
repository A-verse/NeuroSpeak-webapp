import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import {
  Brain,
  BarChart3,
  MessageSquare,
  Zap,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Stress Risk Detection",
    description:
      "Identify meaningful changes in communication patterns when enough data is available.",
  },
  {
    icon: BarChart3,
    title: "Movement Trends",
    description:
      "Understand activity patterns when supported health or wearable data is connected.",
  },
  {
    icon: MessageSquare,
    title: "Communication Health",
    description:
      "Track communication patterns from synced interactions and usage.",
  },
  {
    icon: Zap,
    title: "Actionable Alerts",
    description:
      "Surface significant changes that may need caregiver attention.",
  },
];

const AIAnalysis = () => {
  return (
    <MobileLayout role="caregiver">
      <div
        className="
          min-h-full
          w-full
          min-w-0
          overflow-x-hidden
          px-4
          py-4
          sm:px-6
          sm:py-6
          lg:mx-auto
          lg:max-w-4xl
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
          className="mb-5"
        >
          <div className="flex items-center gap-2">
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
              <Brain className="h-4.5 w-4.5 text-primary" />
            </div>

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
                AI Analysis
              </h1>

              <p className="text-[10px] text-muted-foreground sm:text-xs">
                Behavioral insights for your patient
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            CURRENT STATUS
        ============================================================ */}

        <motion.div
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
            mb-5
            rounded-2xl
            border
            border-border
            bg-card
            p-4
            shadow-card
            sm:p-5
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
              "
            >
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-card-foreground sm:text-base">
                  Analysis not available yet
                </h2>

                <span
                  className="
                    rounded-full
                    bg-muted
                    px-2
                    py-0.5
                    text-[8px]
                    font-medium
                    text-muted-foreground
                    sm:text-[9px]
                  "
                >
                  Waiting for data
                </span>
              </div>

              <p className="mt-1 text-[10px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                Insights will appear here once communication and
                activity data are available for analysis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            INSIGHTS PREVIEW
        ============================================================ */}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            Available insights
          </h2>

          <span className="text-[9px] text-muted-foreground sm:text-[10px]">
            4 categories
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {features.map(
            (feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
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
                      0.14 +
                      index * 0.06,
                  }}
                  className="
                    flex
                    min-w-0
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
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                      {feature.title}
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground sm:text-[10px] sm:leading-5">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
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
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          className="
            mt-5
            flex
            items-start
            gap-2.5
            rounded-xl
            border
            border-border
            bg-muted/50
            p-3
          "
        >
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px] sm:leading-5">
            AI insights are intended to support caregiver
            awareness. They are not medical diagnoses and will
            only be shown when sufficient data is available.
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default AIAnalysis;