import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X, UserCircle, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface LinkableProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
}

function initials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "U";
  return value.charAt(0).toUpperCase();
}

const LinkCaregiverSheet = ({
  onClose,
  onLinked,
}: {
  onClose: () => void;
  onLinked: () => Promise<void> | void;
}) => {
  const { userId, role } = useApp();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<LinkableProfile[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCaregiver = role === "caregiver";
  const targetLabel = isCaregiver ? "patient" : "caregiver";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await db.rpc("list_linkable_profiles");
        if (error) throw error;
        setProfiles(data ?? []);
      } catch (error) {
        console.error("Loading linkable profiles failed:", error);
        setErrorMsg(error instanceof Error ? error.message : "Could not load list.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const sendLinkRequest = async (profile: LinkableProfile) => {
    if (!userId) return;
    setSendingId(profile.id);
    setErrorMsg(null);
    try {
      const { error } = await db.from("caregiver_patient").insert({
        caregiver_id: isCaregiver ? userId : profile.id,
        patient_id: isCaregiver ? profile.id : userId,
      });
      if (error) throw error;
      setSentId(profile.id);
      await onLinked();
      toast({ title: "Request sent", description: `Link request sent to ${profile.full_name || profile.email || "this user"}.` });
    } catch (error) {
      console.error("Send link request failed:", error);
      setErrorMsg(error instanceof Error ? error.message : "Failed to send request.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col justify-end overflow-hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-3xl border-t border-border bg-card px-4 pb-5 pt-4 shadow-elevated sm:px-6"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-muted" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
              Link {targetLabel}
            </h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              Tap a name to send a request
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[10px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
            This gives {isCaregiver ? "you" : "your caregiver"} access to health
            data like location, SOS alerts, and analysis.
          </p>
        </div>

        {errorMsg && (
          <p className="mt-3 px-1 text-[10px] text-destructive sm:text-xs">{errorMsg}</p>
        )}

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-muted/50 p-6 text-center">
            <UserCircle className="h-6 w-6 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold text-foreground">No {targetLabel}s found</p>
            <p className="mt-1 max-w-[260px] text-[10px] leading-4 text-muted-foreground">
              No available {targetLabel} accounts to link with right now.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(profile.full_name, profile.email)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-card-foreground sm:text-sm">
                    {profile.full_name || "NeuroSpeak User"}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">{profile.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void sendLinkRequest(profile)}
                  disabled={sendingId === profile.id || sentId === profile.id}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-primary px-3 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
                >
                  {sendingId === profile.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : sentId === profile.id ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sent
                    </>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LinkCaregiverSheet;