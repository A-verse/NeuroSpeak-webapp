import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Phone,
  UserCircle,
  Check,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

const languages = [
  "English",
  "Spanish",
  "French",
  "Hindi",
  "Arabic",
  "Chinese",
];

const ProfileSetup = () => {
  const navigate = useNavigate();

  const { userName } = useApp();

  const [name, setName] = useState(userName || "");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("English");

  const handleContinue = async () => {
    const trimmedName = name.trim();

    if (trimmedName) {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
        },
      });

      if (error) {
        console.error("Failed to save profile name:", error);
      }
    }

    navigate("/onboarding/accessibility");
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
              Your Profile
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
            Tell us about you
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            A few details help personalize NeuroSpeak.
          </p>
        </motion.div>

        {/* ============================================================
            FORM AREA
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
          {/* ========================================================
              PROFILE PREVIEW
          ======================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.08,
            }}
            className="
              mb-4
              flex
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
            <div className="relative shrink-0">
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-gradient-primary
                  sm:h-20
                  sm:w-20
                "
              >
                {name.trim() ? (
                  <span className="text-2xl font-bold text-primary-foreground">
                    {name
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                ) : (
                  <UserCircle className="h-9 w-9 text-primary-foreground" />
                )}
              </div>

              {/* Visual-only photo indicator */}

              <div
                className="
                  absolute
                  bottom-0
                  right-0
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  bg-card
                  shadow-card
                "
              >
                <Camera className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                Profile
              </p>

              <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
                You can add a profile photo later from Edit Profile.
              </p>
            </div>
          </motion.div>

          {/* ========================================================
              NAME
          ======================================================== */}

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
              delay: 0.14,
            }}
            className="
              mb-3
              rounded-2xl
              border
              border-border
              bg-card
              p-3
              shadow-card
              sm:p-4
            "
          >
            <label
              htmlFor="profile-name"
              className="
                mb-1.5
                block
                text-[10px]
                font-medium
                text-muted-foreground
                sm:text-xs
              "
            >
              Name
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="
                h-11
                w-full
                rounded-xl
                border
                border-border
                bg-muted/50
                px-3
                text-xs
                font-medium
                text-foreground
                outline-none
                placeholder:text-muted-foreground/60
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
                sm:text-sm
              "
            />
          </motion.div>

          {/* ========================================================
              PHONE
          ======================================================== */}

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
              delay: 0.19,
            }}
            className="
              mb-3
              rounded-2xl
              border
              border-border
              bg-card
              p-3
              shadow-card
              sm:p-4
            "
          >
            <label
              htmlFor="profile-phone"
              className="
                mb-1.5
                block
                text-[10px]
                font-medium
                text-muted-foreground
                sm:text-xs
              "
            >
              Phone Number
            </label>

            <div className="relative">
              <Phone
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                id="profile-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 00000 00000"
                autoComplete="tel"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-muted/50
                  pl-10
                  pr-3
                  text-xs
                  font-medium
                  text-foreground
                  outline-none
                  placeholder:text-muted-foreground/60
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                  sm:text-sm
                "
              />
            </div>
          </motion.div>

          {/* ========================================================
              LANGUAGE
          ======================================================== */}

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
              delay: 0.24,
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
            <div className="mb-2.5">
              <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                Preferred Language
              </p>

              <p className="mt-0.5 text-[8px] text-muted-foreground sm:text-[9px]">
                Used for communication features
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {languages.map((lang) => {
                const selected = language === lang;

                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`
                      relative
                      rounded-xl
                      border
                      px-1
                      py-2
                      text-[9px]
                      font-medium
                      transition-all
                      sm:py-2.5
                      sm:text-[10px]
                      ${selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30"
                      }
                    `}
                  >
                    {selected && (
                      <Check
                        className="
                          absolute
                          right-1
                          top-1
                          h-3
                          w-3
                        "
                      />
                    )}

                    {lang}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ============================================================
            FOOTER
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
            delay: 0.3,
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
            onClick={handleContinue}
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

          <button
            type="button"
            onClick={() =>
              navigate("/onboarding/accessibility")
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
            Skip for now
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

export default ProfileSetup;