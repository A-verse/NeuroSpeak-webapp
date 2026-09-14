import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Communicate",
    desc: "Express needs with simple taps",
  },
  {
    icon: Shield,
    title: "Stay Safe",
    desc: "Keep emergency tools close",
  },
  {
    icon: Activity,
    title: "Track Activity",
    desc: "Keep an eye on wellbeing",
  },
  {
    icon: Brain,
    title: "AI Assisted",
    desc: "Supportive communication insights",
  },
];

const Welcome = () => {
  const navigate = useNavigate();

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
          justify-center
        "
      >
        {/* ============================================================
            HERO
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            shrink-0
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-gradient-primary
              shadow-card
              sm:h-20
              sm:w-20
            "
          >
            <Brain
              className="
                h-8
                w-8
                text-primary-foreground
                sm:h-10
                sm:w-10
              "
            />
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
            Welcome to NeuroSpeak
          </h1>

          <p
            className="
              mx-auto
              mt-1.5
              max-w-sm
              text-xs
              leading-5
              text-muted-foreground
              sm:text-sm
            "
          >
            Assistive communication designed to make everyday
            interactions easier.
          </p>
        </motion.div>

        {/* ============================================================
            FEATURES
        ============================================================ */}

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-2.5
            sm:mt-7
            sm:gap-3
          "
        >
          {features.map(
            (feature, index) => {
              const Icon =
                feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.12 +
                      index * 0.06,
                  }}
                  className="
                    flex
                    min-h-[105px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    px-3
                    py-3
                    text-center
                    shadow-card
                    sm:min-h-[115px]
                  "
                >
                  <div
                    className="
                      mb-2
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                    "
                  >
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>

                  <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                    {feature.title}
                  </p>

                  <p className="mt-0.5 max-w-[150px] text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            },
          )}
        </div>

        {/* ============================================================
            CTA
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
            mt-6
            w-full
            sm:mt-7
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/onboarding/permissions",
              )
            }
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
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
            Get Started

            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/role-select",
              )
            }
            className="
              mt-2
              w-full
              py-1
              text-[10px]
              font-medium
              text-muted-foreground
              transition
              hover:text-foreground
              sm:text-xs
            "
          >
            Skip setup
          </button>
        </motion.div>

        {/* ============================================================
            PROGRESS
        ============================================================ */}

        <div className="mt-4 flex justify-center gap-1">
          <span className="h-1 w-5 rounded-full bg-primary" />
          <span className="h-1 w-5 rounded-full bg-muted" />
          <span className="h-1 w-5 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
};

export default Welcome;