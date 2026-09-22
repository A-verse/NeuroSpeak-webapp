import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  MailCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { role } = useApp();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [awaitingConfirmation, setAwaitingConfirmation] =
    useState(false);

  const handleSignup = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const resolvedRole:
        | "user"
        | "caregiver" =
        role === "caregiver"
          ? "caregiver"
          : "user";

      const data = await signUp(
        email.trim(),
        password,
        name.trim(),
        resolvedRole,
      );

      // Email confirmation is required.
      if (data.user && !data.session) {
        setAwaitingConfirmation(true);

        toast.success(
          "Check your email for the confirmation link.",
        );

        return;
      }

      // Session exists, so the account is immediately usable.
      toast.success(
        "Account created successfully.",
      );

      navigate(
        "/onboarding/profile-setup",
      );
    } catch (err: unknown) {
      const supaErr =
        err as {
          message?: string;
          code?: string;
          status?: number;
        };

      const detail = [
        supaErr.message,
        supaErr.code
          ? `code: ${supaErr.code}`
          : null,
        supaErr.status
          ? `status: ${supaErr.status}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

      console.error(
        "[Signup] Supabase error",
        supaErr,
      );

      toast.error(
        detail ||
        "Sign up failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  {/* ================================================================
      EMAIL CONFIRMATION
  ================================================================ */}

  if (awaitingConfirmation) {
    return (
      <div
        className="
          flex
          h-[100dvh]
          min-h-0
          w-full
          min-w-0
          items-center
          justify-center
          overflow-x-hidden
          bg-background
          px-4
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            w-full
            max-w-md
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
            "
          >
            <MailCheck className="h-8 w-8 text-primary" />
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
            Check your email
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-sm
              text-xs
              leading-5
              text-muted-foreground
              sm:text-sm
            "
          >
            We sent a confirmation link to{" "}
            <span className="font-semibold text-foreground break-all">
              {email}
            </span>
            .
          </p>

          <p
            className="
              mx-auto
              mt-1
              max-w-sm
              text-[10px]
              leading-4
              text-muted-foreground
              sm:text-xs
            "
          >
            Confirm your email, then return here to log in.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="
              mt-6
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              px-5
              text-xs
              font-semibold
              text-primary
              transition
              hover:bg-primary/15
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:text-sm
            "
          >
            Back to Log In
          </button>
        </motion.div>
      </div>
    );
  }

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
            BACK
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            x: -8,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="shrink-0"
        >
          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-lg
              px-1
              text-xs
              font-medium
              text-muted-foreground
              transition
              hover:text-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </motion.div>

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
          transition={{
            delay: 0.08,
          }}
          className="
            mb-5
            mt-4
            shrink-0
            sm:mb-6
          "
        >
          <div
            className="
              mb-3
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-primary/10
            "
          >
            <UserPlus className="h-5 w-5 text-primary" />
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
            Create Account
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {role === "caregiver"
              ? "Create your Caregiver account"
              : "Create your NeuroSpeak account"}
          </p>
        </motion.div>

        {/* ============================================================
            FORM
        ============================================================ */}

        <motion.form
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.14,
          }}
          onSubmit={handleSignup}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div className="space-y-3">
            {/* Name */}

            <div>
              <Label
                htmlFor="name"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-medium
                  text-muted-foreground
                  sm:text-xs
                "
              >
                Full Name
              </Label>

              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value,
                  )
                }
                autoComplete="name"
                required
                className="
                  h-11
                  rounded-xl
                  border-border
                  bg-card
                  text-xs
                  sm:text-sm
                "
              />
            </div>

            {/* Email */}

            <div>
              <Label
                htmlFor="email"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-medium
                  text-muted-foreground
                  sm:text-xs
                "
              >
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value,
                  )
                }
                autoComplete="email"
                required
                className="
                  h-11
                  rounded-xl
                  border-border
                  bg-card
                  text-xs
                  sm:text-sm
                "
              />
            </div>

            {/* Password */}

            <div>
              <Label
                htmlFor="password"
                className="
                  mb-1.5
                  block
                  text-[10px]
                  font-medium
                  text-muted-foreground
                  sm:text-xs
                "
              >
                Password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value,
                    )
                  }
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="
                    h-11
                    rounded-xl
                    border-border
                    bg-card
                    pr-11
                    text-xs
                    sm:text-sm
                  "
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Use at least 6 characters.
              </p>
            </div>
          </div>

          {/* ========================================================
              SUBMIT
          ======================================================== */}

          <div className="mt-auto pt-5">
            <Button
              type="submit"
              disabled={isLoading}
              className="
                h-12
                w-full
                rounded-xl
                bg-gradient-primary
                text-sm
                font-semibold
                text-primary-foreground
                shadow-card
                disabled:opacity-70
                sm:text-base
              "
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <p
              className="
                mt-3
                text-center
                text-[10px]
                text-muted-foreground
                sm:text-xs
              "
            >
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  font-semibold
                  text-primary
                  hover:underline
                  focus-visible:outline-none
                "
              >
                Log In
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Signup;