import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
} from "lucide-react";
import logo from "@/assets/neurospeak-logo.png";
import { haptics } from "@/lib/haptics";
import { signIn } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { role } = useApp();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleLogin = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const data = await signIn(
        email.trim(),
        password,
      );

      if (data.role === "caregiver") {
        navigate("/caregiver");
      } else if (data.role === "user") {
        navigate("/user");
      } else {
        throw new Error("Your account does not have a valid persisted role.");
      }
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
        "[Login] Supabase error",
        supaErr,
      );

      toast.error(
        detail ||
        "Login failed. Please check your email and password.",
      );
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => {
              haptics.light();
              navigate("/role-select");
            }}
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
            mb-6
            mt-5
            shrink-0
            text-center
          "
        >
          <img
            src={logo}
            alt="NeuroSpeak"
            className="
              mx-auto
              mb-3
              h-12
              w-12
              rounded-xl
              sm:h-14
              sm:w-14
            "
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
            Welcome back
          </h1>

          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Sign in to continue to NeuroSpeak
          </p>

          {/* Role */}

          <div
            className="
              mx-auto
              mt-3
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-border
              bg-muted/60
              px-3
              py-1
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

            <span className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              {role === "caregiver"
                ? "Caregiver Account"
                : "User Account"}
            </span>
          </div>
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
          onSubmit={handleLogin}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div className="space-y-3">
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
                inputMode="email"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value,
                    )
                  }
                  autoComplete="current-password"
                  required
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
            </div>

            {/* Forgot password */}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/forgot-password",
                  )
                }
                className="
                  text-[10px]
                  font-medium
                  text-primary
                  transition
                  hover:underline
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                  sm:text-xs
                "
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* ========================================================
              ACTIONS
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
                transition
                disabled:opacity-70
                sm:text-base
              "
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Log In
                </span>
              )}
            </Button>

            <p
              className="
                mt-4
                text-center
                text-[10px]
                text-muted-foreground
                sm:text-xs
              "
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  navigate("/signup");
                }}
                className="
                  font-semibold
                  text-primary
                  hover:underline
                  focus-visible:outline-none
                "
              >
                Sign Up
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;