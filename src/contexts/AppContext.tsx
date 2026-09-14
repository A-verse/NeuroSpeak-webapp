/**
 * AppContext — application-wide state, identity derived from Supabase auth.
 *
 * Identity flow:
 *   supabase.auth.onAuthStateChange
 *   → Supabase user
 *   → user_metadata (full_name, role, avatar_url)
 *   → AppContext
 *   → all screens
 *
 * Identity is never hardcoded.
 * While the initial session is resolving, `isSessionLoading` is true.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getPersistedRole } from "@/lib/auth";

export type UserRole = "user" | "caregiver" | null;

interface AppContextType {
  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------

  userId: string | null;
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  isLoggedIn: boolean;
  isSessionLoading: boolean;

  // ---------------------------------------------------------------------------
  // Role
  // ---------------------------------------------------------------------------

  role: UserRole;
  setRole: (role: UserRole) => void;

  // ---------------------------------------------------------------------------
  // Onboarding
  // ---------------------------------------------------------------------------

  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;

  // ---------------------------------------------------------------------------
  // Accessibility / Appearance
  // ---------------------------------------------------------------------------

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  textSize: "normal" | "large" | "extra-large";
  setTextSize: (
    size: "normal" | "large" | "extra-large"
  ) => void;

  highContrast: boolean;
  setHighContrast: (value: boolean) => void;

  speechRate: number;
  setSpeechRate: (rate: number) => void;

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(
  undefined
);

/**
 * Safely converts Supabase user metadata into the application's role.
 */
async function resolveRole(user: User | null): Promise<UserRole> {
  if (!user) return null;
  return getPersistedRole(user.id);
}

export const AppProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ---------------------------------------------------------------------------
  // Supabase identity
  // ---------------------------------------------------------------------------

  const [supabaseUser, setSupabaseUser] =
    useState<User | null>(null);

  const [isSessionLoading, setIsSessionLoading] =
    useState(true);

  // ---------------------------------------------------------------------------
  // Application state
  // ---------------------------------------------------------------------------

  const [role, setRole] =
    useState<UserRole>(null);

  const [onboardingComplete, setOnboardingComplete] =
    useState(false);

  const [isDarkMode, setIsDarkMode] =
    useState(false);

  const [textSize, setTextSize] = useState<
    "normal" | "large" | "extra-large"
  >("normal");

  const [highContrast, setHighContrast] =
    useState(false);

  const [speechRate, setSpeechRate] =
    useState(0.9);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Supabase authentication
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    /**
     * Load the existing session when the app starts.
     */
    const loadInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        const user = session?.user ?? null;

        setSupabaseUser(user);
        setAvatarUrl(user?.user_metadata?.avatar_url ?? null);
        setRole(await resolveRole(user));
      } catch (error) {
        console.error(
          "Failed to load Supabase session:",
          error
        );

        if (!mounted) {
          return;
        }

        setSupabaseUser(null);
        setRole(null);
        setAvatarUrl(null);
      } finally {
        if (mounted) {
          setIsSessionLoading(false);
        }
      }
    };

    loadInitialSession();

    /**
     * Keep application identity synchronized with Supabase Auth.
     *
     * Handles:
     * - SIGNED_IN
     * - SIGNED_OUT
     * - TOKEN_REFRESHED
     * - USER_UPDATED
     * - other auth state changes
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        const user = session?.user ?? null;

        setSupabaseUser(user);
        setAvatarUrl(user?.user_metadata?.avatar_url ?? null);

        // Do the profile lookup outside the auth callback's synchronous work.
        window.setTimeout(async () => {
          if (!mounted) return;
          const persistedRole = await resolveRole(user);
          if (!mounted) return;
          setRole(persistedRole);
          setIsSessionLoading(false);
        }, 0);

        // Clear onboarding state immediately after logout.
        if (!user) {
          setOnboardingComplete(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Dark mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      isDarkMode
    );
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((previous) => !previous);
  };

  // ---------------------------------------------------------------------------
  // Text size
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fontSize =
      textSize === "extra-large"
        ? "20px"
        : textSize === "large"
          ? "18px"
          : "16px";

    document.documentElement.style.fontSize = fontSize;

    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [textSize]);

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  const logout = async () => {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // The auth listener also clears the Supabase user.
      // These are local application states that should
      // not survive logout.
      setSupabaseUser(null);
      setRole(null);
      setAvatarUrl(null);
      setOnboardingComplete(false);
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // Derived identity
  // ---------------------------------------------------------------------------

  const isLoggedIn = Boolean(supabaseUser);

  const userName =
    supabaseUser?.user_metadata?.full_name
      ?.trim() ?? "";

  const userEmail =
    supabaseUser?.email ?? "";

  const userId =
    supabaseUser?.id ?? null;

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------

  return (
    <AppContext.Provider
      value={{
        // Identity
        userId,
        userName,
        userEmail,
        avatarUrl,
        setAvatarUrl,

        // Auth
        isLoggedIn,
        isSessionLoading,

        // Role
        role,
        setRole,

        // Onboarding
        onboardingComplete,
        setOnboardingComplete,

        // Appearance
        isDarkMode,
        toggleDarkMode,

        // Accessibility
        textSize,
        setTextSize,
        highContrast,
        setHighContrast,
        speechRate,
        setSpeechRate,

        // Logout
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * Access application-wide state.
 */
export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return context;
};