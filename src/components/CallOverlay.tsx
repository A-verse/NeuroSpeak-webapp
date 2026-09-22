import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Clock,
} from "lucide-react";

import {
  type CallState,
  type CallType,
  type CallContact,
} from "@/hooks/useCallState";

interface CallOverlayProps {
  callState: CallState;
  callType: CallType;
  contact: CallContact | null;
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOn: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const remainingSeconds = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

const CallButton = ({
  onPress,
  icon: Icon,
  label,
  variant = "default",
  disabled = false,
}: {
  onPress: () => void;
  icon: React.ElementType;
  label: string;
  variant?: "default" | "accept" | "end";
  disabled?: boolean;
}) => {
  const background =
    variant === "accept"
      ? "bg-success"
      : variant === "end"
        ? "bg-destructive"
        : "bg-white/15";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      className={`flex flex-col items-center gap-1.5 transition-opacity ${disabled ? "opacity-40" : ""
        }`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-elevated ${background}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </span>

      <span className="text-[11px] font-medium text-white/80">
        {label}
      </span>
    </motion.button>
  );
};

const AvatarBubble = ({
  contact,
  pulse = false,
}: {
  contact: CallContact;
  pulse?: boolean;
}) => {
  return (
    <div className="relative mb-5 flex items-center justify-center">
      {pulse && (
        <>
          <span className="absolute h-36 w-36 animate-ping rounded-full bg-white/10" />
          <span className="absolute h-28 w-28 animate-ping rounded-full bg-white/10 [animation-delay:0.5s]" />
        </>
      )}

      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/30 bg-white/15">
        <span className="text-4xl font-bold text-white">
          {contact.avatar}
        </span>
      </div>
    </div>
  );
};

export default function CallOverlay({
  callState,
  callType,
  contact,
  duration,
  isMuted,
  isSpeakerOn,
  isCameraOn,
  onAccept,
  onDecline,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
}: CallOverlayProps) {
  const isVisible =
    callState !== "idle" &&
    callState !== "ended" &&
    callState !== "declined" &&
    callState !== "missed";

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (
    !contact &&
    callState !== "ended" &&
    callState !== "declined"
  ) {
    return null;
  }

  const statusLabel: Record<CallState, string> = {
    idle: "",
    outgoing: "Calling…",
    connecting: "Connecting…",
    ringing: "Ringing…",
    active: formatDuration(duration),
    incoming: `Incoming ${callType} call`,
    declined: "Call declined",
    missed: "Missed call",
    ended: "Call ended",
  };

  const showCallScreen =
    isVisible ||
    callState === "ended" ||
    callState === "declined";

  return (
    <AnimatePresence>
      {showCallScreen && (
        <motion.div
          key="call-overlay"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 280,
          }}
          className="fixed inset-0 z-[200] flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[hsl(174,58%,20%)] to-[hsl(200,55%,14%)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-label={
            callType === "video" ? "Video call" : "Voice call"
          }
        >
          {/* Header */}
          <div className="flex w-full flex-col items-center pt-2 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              {callType === "video" ? "Video Call" : "Voice Call"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {contact?.name ?? "Unknown contact"}
            </h2>

            {contact?.role && (
              <p className="mt-0.5 text-sm text-white/60">
                {contact.role}
              </p>
            )}
          </div>

          {/* Main */}
          <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center">
            {contact && (
              <AvatarBubble
                contact={contact}
                pulse={
                  callState === "outgoing" ||
                  callState === "ringing" ||
                  callState === "incoming"
                }
              />
            )}

            <div className="flex items-center gap-2">
              {callState === "active" && (
                <Clock className="h-3.5 w-3.5 text-white/60" />
              )}

              <p className="text-sm font-medium text-white/75">
                {statusLabel[callState]}
              </p>
            </div>

            {/* Video preview area */}
            {callType === "video" && callState === "active" && (
              <div className="relative mt-6 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/20 aspect-video">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <VideoOff className="h-7 w-7 text-white/25" />
                  <p className="text-xs text-white/45">
                    Video connection unavailable
                  </p>
                </div>

                <div className="absolute right-3 top-3 flex h-20 w-16 items-center justify-center rounded-xl border border-white/15 bg-black/40">
                  {isCameraOn ? (
                    <Video className="h-4 w-4 text-white/50" />
                  ) : (
                    <VideoOff className="h-4 w-4 text-white/35" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full max-w-sm">
            {/* Outgoing */}
            {(callState === "outgoing" ||
              callState === "connecting" ||
              callState === "ringing") && (
                <div className="flex justify-center">
                  <CallButton
                    onPress={onEnd}
                    icon={PhoneOff}
                    label="Cancel"
                    variant="end"
                  />
                </div>
              )}

            {/* Incoming */}
            {callState === "incoming" && (
              <div className="flex items-center justify-around">
                <CallButton
                  onPress={onDecline}
                  icon={PhoneOff}
                  label="Decline"
                  variant="end"
                />

                <CallButton
                  onPress={onAccept}
                  icon={Phone}
                  label="Accept"
                  variant="accept"
                />
              </div>
            )}

            {/* Active */}
            {callState === "active" && (
              <div className="flex flex-wrap items-start justify-center gap-x-7 gap-y-4">
                <CallButton
                  onPress={onToggleMute}
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? "Unmute" : "Mute"}
                />

                <CallButton
                  onPress={onToggleSpeaker}
                  icon={isSpeakerOn ? Volume2 : VolumeX}
                  label={isSpeakerOn ? "Speaker" : "Earpiece"}
                />

                {callType === "video" && (
                  <CallButton
                    onPress={onToggleCamera}
                    icon={isCameraOn ? Video : VideoOff}
                    label={isCameraOn ? "Camera" : "Camera off"}
                  />
                )}

                <CallButton
                  onPress={onEnd}
                  icon={PhoneOff}
                  label="End"
                  variant="end"
                />
              </div>
            )}

            {/* Finished */}
            {(callState === "ended" ||
              callState === "declined") && (
                <div className="flex justify-center">
                  <p className="text-sm text-white/55">
                    {callState === "ended"
                      ? "Call ended"
                      : "Call declined"}
                  </p>
                </div>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}