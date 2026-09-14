import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  ChevronRight,
  Check,
} from "lucide-react";
import logo from "@/assets/neurospeak-logo.png";
import { haptics } from "@/lib/haptics";

const roles = [
  {
    id: "user" as const,
    title: "I need to communicate",
    desc: "Express needs and feelings with easy-to-use tools",
    icon: User,
  },
  {
    id: "caregiver" as const,
    title: "I am a caregiver",
    desc: "Support communication, safety, and daily wellbeing",
    icon: Shield,
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();
  const { setRole, isLoggedIn, isSessionLoading, role: currentRole } = useApp();

  useEffect(() => {
    if (!isSessionLoading && isLoggedIn && currentRole) {
      navigate(currentRole === "caregiver" ? "/caregiver" : "/user", { replace: true });
    }
  }, [isLoggedIn, isSessionLoading, currentRole, navigate]);

  const handleSelect = (
    role: "user" | "caregiver",
  ) => {
    haptics.medium();
    setRole(role);
    navigate("/login");
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
          justify-center
        "
      >
        {/* ============================================================
            HEADER
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
            mb-7
            shrink-0
            text-center
            sm:mb-9
          "
        >
          <motion.img
            src={logo}
            alt="NeuroSpeak"
            className="
              mx-auto
              mb-4
              h-14
              w-14
              rounded-2xl
              sm:h-16
              sm:w-16
            "
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.35,
            }}
          />

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >
            Choose your role
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
            How will you be using NeuroSpeak?
          </p>
        </motion.div>

        {/* ============================================================
            ROLE OPTIONS
        ============================================================ */}

        <div
          className="
            flex
            w-full
            flex-col
            gap-3
          "
        >
          {roles.map(
            (role, index) => {
              const Icon = role.icon;

              return (
                <motion.button
                  key={role.id}
                  type="button"
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
                      0.1 +
                      index * 0.08,
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  onClick={() =>
                    handleSelect(
                      role.id,
                    )
                  }
                  className="
                    group
                    flex
                    min-w-0
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    p-4
                    text-left
                    shadow-card
                    transition-all
                    hover:border-primary/40
                    hover:shadow-elevated
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    sm:gap-4
                    sm:p-5
                  "
                >
                  {/* Icon */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                      transition-colors
                      group-hover:bg-primary/15
                      sm:h-12
                      sm:w-12
                    "
                  >
                    <Icon
                      className="
                        h-5
                        w-5
                        text-primary
                        sm:h-6
                        sm:w-6
                      "
                    />
                  </div>

                  {/* Text */}

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-card-foreground
                        sm:text-sm
                      "
                    >
                      {role.title}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        leading-4
                        text-muted-foreground
                        sm:text-[10px]
                        sm:leading-5
                      "
                    >
                      {role.desc}
                    </p>
                  </div>

                  {/* Arrow */}

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-muted
                      transition-all
                      group-hover:bg-primary/10
                    "
                  >
                    <ChevronRight
                      className="
                        h-4
                        w-4
                        text-muted-foreground
                        transition-colors
                        group-hover:text-primary
                      "
                    />
                  </div>
                </motion.button>
              );
            },
          )}
        </div>

        {/* ============================================================
            PRIVACY / ROLE NOTE
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.35,
          }}
          className="
            mt-5
            rounded-xl
            border
            border-border
            bg-muted/50
            px-3
            py-2.5
            text-center
          "
        >
          <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
            Your role helps NeuroSpeak show the right tools and
            permissions for your account.
          </p>
        </motion.div>

        {/* ============================================================
            PROGRESS
        ============================================================ */}

        <div className="mt-5 flex justify-center gap-1">
          <span className="h-1 w-5 rounded-full bg-primary" />
          <span className="h-1 w-5 rounded-full bg-muted" />
          <span className="h-1 w-5 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;