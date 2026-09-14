import { useState, useEffect, useRef, useCallback } from "react";

export type CallType = "voice" | "video";

export type CallState =
  | "idle"
  | "outgoing"
  | "connecting"
  | "ringing"
  | "active"
  | "incoming"
  | "declined"
  | "missed"
  | "ended";

export interface CallContact {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface UseCallStateReturn {
  callState: CallState;
  callType: CallType;
  contact: CallContact | null;
  duration: number; // seconds
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOn: boolean;
  startCall: (contact: CallContact, type: CallType) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleCamera: () => void;
  /** Simulate incoming call — replace with real WebRTC signaling event */
  simulateIncomingCall: (contact: CallContact, type: CallType) => void;
}

/**
 * Frontend-only call state machine.
 *
 * TODO (WebRTC integration):
 *   - Replace `startCall` internals with SDP offer / signaling server emit
 *   - Replace `acceptCall` with SDP answer + ICE candidate exchange
 *   - Replace `simulateIncomingCall` with signaling server "incoming-call" event listener
 *   - Connect `endCall` to peer-connection close + signaling "hangup" emit
 *   - Add RTCPeerConnection / media stream management here
 */
export function useCallState(): UseCallStateReturn {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<CallType>("voice");
  const [contact, setContact] = useState<CallContact | null>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (connectingRef.current) clearTimeout(connectingRef.current);
    if (ringingRef.current) clearTimeout(ringingRef.current);
    timerRef.current = null;
    connectingRef.current = null;
    ringingRef.current = null;
  }, []);

  useEffect(() => {
    if (callState === "active") {
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const startCall = useCallback(
    (c: CallContact, type: CallType) => {
      clearTimers();
      setContact(c);
      setCallType(type);
      setIsMuted(false);
      setIsSpeakerOn(false);
      setIsCameraOn(true);
      setCallState("outgoing");

      // TODO: Emit signaling "call-request" to server here
      // Simulate progression: outgoing → connecting → ringing
      connectingRef.current = setTimeout(() => {
        setCallState("connecting");
        ringingRef.current = setTimeout(() => {
          setCallState("ringing");
          // In production: wait for remote "ringing" signaling event
          // For demo we do NOT auto-answer — user must manually end or the remote would accept
        }, 1500);
      }, 1200);
    },
    [clearTimers]
  );

  const acceptCall = useCallback(() => {
    clearTimers();
    // TODO: Send SDP answer to signaling server here
    setCallState("active");
  }, [clearTimers]);

  const declineCall = useCallback(() => {
    clearTimers();
    // TODO: Emit "call-declined" to signaling server
    setCallState("declined");
    setTimeout(() => setCallState("idle"), 2000);
  }, [clearTimers]);

  const endCall = useCallback(() => {
    clearTimers();
    // TODO: Close RTCPeerConnection and emit "hangup" to signaling server
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
      setContact(null);
      setDuration(0);
    }, 1500);
  }, [clearTimers]);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const toggleSpeaker = useCallback(() => setIsSpeakerOn((s) => !s), []);
  const toggleCamera = useCallback(() => setIsCameraOn((c) => !c), []);

  const simulateIncomingCall = useCallback(
    (c: CallContact, type: CallType) => {
      // TODO: Replace with real signaling server "incoming-call" event
      clearTimers();
      setContact(c);
      setCallType(type);
      setCallState("incoming");
    },
    [clearTimers]
  );

  return {
    callState,
    callType,
    contact,
    duration,
    isMuted,
    isSpeakerOn,
    isCameraOn,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    toggleCamera,
    simulateIncomingCall,
  };
}
