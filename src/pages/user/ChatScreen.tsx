import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import CallOverlay from "@/components/CallOverlay";
import { useCallState, type CallContact } from "@/hooks/useCallState";
import { useTTS } from "@/hooks/useTTS";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { haptics } from "@/lib/haptics";
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, Info, Loader2, MessagesSquare,
  Mic, MicOff, Phone, Plus, Search, Send, Share2, UserCircle, Video, Volume2, X,
} from "lucide-react";

// Chat uses its own communication-only tables. They are intentionally separate
// from caregiver_patient and the health-data conversations/messages tables.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Role = "user" | "caregiver";
type Phase = "search" | "searching" | "found" | "not_found" | "sending" | "sent";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  unread: number;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  time: string;
  status: "sent" | "delivered" | "read";
}

interface FoundProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface IncomingRequest {
  id: string;
  requesterId: string;
  name: string;
  email: string;
  avatar: string;
}

type DeviceContact = { name?: string[]; email?: string[] };
type DeviceContactPicker = {
  select: (properties: Array<"name" | "email">, options?: { multiple?: boolean }) => Promise<DeviceContact[]>;
};

function getDeviceContactPicker(): DeviceContactPicker | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { contacts?: DeviceContactPicker }).contacts ?? null;
}

function initials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "U";
  return value.charAt(0).toUpperCase();
}

function displayRole(role: unknown) {
  return role === "caregiver" ? "Caregiver" : "Communication user";
}

const AddContactSheet = ({
  onClose,
  currentUserId,
  onChanged,
  role,
}: {
  onClose: () => void;
  currentUserId: string | null;
  onChanged: () => Promise<void>;
  role: "user" | "caregiver";
}) => {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("search");
  const [found, setFound] = useState<FoundProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  // ---- Caregiver/Patient linking list (shown above email search) ----
  const isCaregiver = role === "caregiver";
  const targetLabel = isCaregiver ? "patient" : "caregiver";
  const [linkLoading, setLinkLoading] = useState(true);
  const [linkProfiles, setLinkProfiles] = useState<FoundProfile[]>([]);
  const [linkSendingId, setLinkSendingId] = useState<string | null>(null);
  const [linkSentId, setLinkSentId] = useState<string | null>(null);

  useEffect(() => {
    const loadLinkable = async () => {
      setLinkLoading(true);
      try {
        const { data, error } = await db.rpc("list_linkable_profiles");
        if (error) throw error;
        setLinkProfiles(data ?? []);
      } catch (error) {
        console.error("Loading linkable profiles failed:", error);
      } finally {
        setLinkLoading(false);
      }
    };
    void loadLinkable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendLinkRequest = async (profile: FoundProfile) => {
    if (!currentUserId) return;
    setLinkSendingId(profile.id);
    try {
      const { error } = await db.from("caregiver_patient").insert({
        caregiver_id: isCaregiver ? currentUserId : profile.id,
        patient_id: isCaregiver ? profile.id : currentUserId,
      });
      if (error) throw error;
      setLinkSentId(profile.id);
      toast({ title: "Request sent", description: `Link request sent to ${profile.full_name || profile.email || "this user"}.` });
    } catch (error) {
      console.error("Send link request failed:", error);
      toast({ title: "Could not send request", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLinkSendingId(null);
    }
  };
  // ---- end linking section ----

  const searchProfile = async (value?: string) => {
    const trimmed = (value ?? email).trim().toLowerCase();
    if (!trimmed) return;
    if (!trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg(null);
    setPhase("searching");
    try {
      const { data, error } = await db.rpc("find_chat_profile_by_email", { target_email: trimmed });
      if (error) throw error;
      const profile = Array.isArray(data) ? data[0] : data;
      if (!profile) {
        setPhase("not_found");
        return;
      }
      if (currentUserId && profile.id === currentUserId) {
        setErrorMsg("You cannot add yourself as a contact.");
        setPhase("search");
        return;
      }
      setFound(profile);
      setPhase("found");
    } catch (error) {
      console.error("Contact search failed:", error);
      setErrorMsg(error instanceof Error ? error.message : "Search failed. Please try again.");
      setPhase("search");
    }
  };

  const pickLocalContact = async () => {
    const picker = getDeviceContactPicker();
    if (!picker) {
      toast({ title: "Device contacts unavailable", description: "This browser does not support contact access. Use email search instead." });
      return;
    }
    try {
      const selected = (await picker.select(["name", "email"], { multiple: false }))[0];
      const selectedEmail = selected?.email?.[0]?.trim().toLowerCase() ?? "";
      if (!selectedEmail) {
        setErrorMsg("This device contact has no email. NeuroSpeak currently matches accounts by email.");
        setPhase("search");
        return;
      }
      setEmail(selectedEmail);
      await searchProfile(selectedEmail);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Device contact selection failed:", error);
      setErrorMsg("Unable to access device contacts. Please try again.");
    }
  };

  const sendRequest = async () => {
    if (!found || !currentUserId) return;
    setPhase("sending");
    try {
      const { error } = await db.from("connection_requests").insert({
        requester_id: currentUserId,
        recipient_id: found.id,
        status: "pending",
      });
      if (error?.code === "23505") {
        const { data: existing, error: existingError } = await db
          .from("connection_requests")
          .select("id,status")
          .or(`and(requester_id.eq.${currentUserId},recipient_id.eq.${found.id}),and(requester_id.eq.${found.id},recipient_id.eq.${currentUserId})`)
          .limit(1)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing?.status === "accepted") {
          setErrorMsg("This user is already in your contacts.");
        } else if (existing?.status === "pending") {
          setErrorMsg("A contact request is already pending.");
        } else if (existing?.id) {
          const { error: updateError } = await db.from("connection_requests").update({ status: "pending" }).eq("id", existing.id);
          if (updateError) throw updateError;
          setPhase("sent");
          await onChanged();
          return;
        }
        setPhase("found");
        return;
      }
      if (error) throw error;
      setPhase("sent");
      await onChanged();
      toast({ title: "Request sent", description: `Contact request sent to ${found.full_name || found.email || "this user"}.` });
    } catch (error) {
      console.error("Send contact request failed:", error);
      setErrorMsg(error instanceof Error ? error.message : "Failed to send request.");
      setPhase("found");
    }
  };

  const invite = async () => {
    const text = "I'd like to connect with you on NeuroSpeak, an assistive communication app. Join here: https://neurospeak.app";
    try {
      if (navigator.share) await navigator.share({ title: "Join me on NeuroSpeak", text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Invite link copied to clipboard." });
      }
    } catch {
      // User cancelled or sharing is unavailable.
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex flex-col justify-end overflow-hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="relative max-h-[88dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-3xl border-t border-border bg-card px-4 pb-5 pt-4 shadow-elevated sm:px-6" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-muted" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><h2 className="truncate text-base font-bold text-foreground sm:text-lg">Add Contact</h2><p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">Connect with another NeuroSpeak user</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        {/* ==================== Caregiver/Patient quick-link list ==================== */}
        <div className="mt-4">
          <p className="mb-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Your {targetLabel}
          </p>
          {linkLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : linkProfiles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-3 text-[10px] text-muted-foreground">
              No available {targetLabel} accounts right now.
            </p>
          ) : (
            <div className="grid gap-2">
              {linkProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-card">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(profile.full_name, profile.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-card-foreground">{profile.full_name || "NeuroSpeak User"}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{profile.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void sendLinkRequest(profile)}
                    disabled={linkSendingId === profile.id || linkSentId === profile.id}
                    className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-gradient-primary px-2.5 text-[10px] font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {linkSendingId === profile.id ? <Loader2 className="h-3 w-3 animate-spin" /> : linkSentId === profile.id ? <><CheckCircle2 className="h-3 w-3" />Sent</> : "Link"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Other contacts
          </p>
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /><p className="text-[10px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">This is a <strong>communication-only</strong> connection. It does not grant caregiver access to health data.</p></div>
        </div>

        {(phase === "search" || phase === "searching") && <div className="mt-3">
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }} onKeyDown={(e) => { if (e.key === "Enter") void searchProfile(); }} placeholder="Search by email" autoCapitalize="none" autoCorrect="off" className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-3 py-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 sm:text-sm" />
            <button type="button" onClick={() => void searchProfile()} disabled={phase === "searching" || !email.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-40" aria-label="Search">{phase === "searching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button>
          </div>
          <button type="button" onClick={() => void pickLocalContact()} disabled={phase === "searching"} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"><UserCircle className="h-4 w-4" />Choose from device contacts</button>
          <p className="mt-2 px-1 text-[10px] leading-4 text-muted-foreground sm:text-xs">Pick a saved contact and NeuroSpeak will use their email to find their account.</p>
          {errorMsg && <p className="mt-2 px-1 text-[10px] text-destructive sm:text-xs">{errorMsg}</p>}
        </div>}

        {phase === "found" && found && <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary">{found.avatar_url ? <img src={found.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="font-bold text-primary-foreground">{initials(found.full_name, found.email)}</span>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{found.full_name || "NeuroSpeak User"}</p><p className="truncate text-[11px] text-muted-foreground">{found.email}</p></div></div>
          {errorMsg && <p className="px-1 text-[10px] text-destructive sm:text-xs">{errorMsg}</p>}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { setPhase("search"); setFound(null); setErrorMsg(null); }} className="h-10 rounded-xl border border-border bg-card text-xs font-semibold text-foreground">Search Again</button><button type="button" onClick={() => void sendRequest()} className="h-10 rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">Send Request</button></div>
        </div>}

        {phase === "sending" && <div className="flex flex-col items-center gap-3 py-10 text-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /><p className="text-xs text-muted-foreground">Sending request...</p></div>}
        {phase === "sent" && <div className="flex flex-col items-center gap-2 py-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><CheckCircle2 className="h-7 w-7 text-primary" /></div><p className="mt-1 text-sm font-bold text-foreground">Request Sent</p><p className="max-w-[280px] text-[11px] leading-5 text-muted-foreground">The user will receive your contact request.</p><button type="button" onClick={onClose} className="mt-3 h-10 w-full rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">Done</button></div>}
        {phase === "not_found" && <div className="mt-4 space-y-3"><div className="flex flex-col items-center rounded-2xl border border-border bg-muted/50 p-5 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background"><UserCircle className="h-6 w-6 text-muted-foreground/50" /></div><p className="mt-3 text-sm font-semibold text-foreground">No NeuroSpeak account found</p><p className="mt-1 max-w-[280px] text-[10px] leading-4 text-muted-foreground">No account is registered with <strong>{email}</strong>.</p></div><button type="button" onClick={() => void invite()} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-xs font-semibold text-foreground"><Share2 className="h-3.5 w-3.5 text-primary" />Invite to NeuroSpeak</button><button type="button" onClick={() => { setPhase("search"); setEmail(""); setErrorMsg(null); }} className="h-10 w-full rounded-xl bg-muted text-xs font-semibold text-muted-foreground">Search Again</button></div>}
      </motion.div>
    </motion.div>
  );
};

const ChatScreen = ({ role = "user" }: { role?: Role }) => {
  const { userId, speechRate } = useApp();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<IncomingRequest[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showParticipantSheet, setShowParticipantSheet] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const call = useCallState();
  const tts = useTTS({ rate: speechRate });

  const activeContact = useMemo(() => contacts.find((c) => c.id === activeChat) ?? null, [contacts, activeChat]);

  const loadContacts = useCallback(async () => {
    if (!userId) return;
    try {
      const [{ data: contactsData, error: contactsError }, { data: requestsData, error: requestsError }] = await Promise.all([
        db.rpc("get_chat_contacts"),
        db.rpc("get_incoming_chat_requests"),
      ]);
      if (contactsError) throw contactsError;
      if (requestsError) throw requestsError;
      setContacts((contactsData ?? []).map((p: any) => ({ id: p.id, name: p.full_name || p.email || "NeuroSpeak User", role: displayRole(p.role), avatar: initials(p.full_name, p.email), lastMessage: "Tap to open conversation", unread: 0 })));
      setPendingRequests((requestsData ?? []).map((r: any) => ({ id: r.id, requesterId: r.requester_id, name: r.requester_name || r.requester_email || "NeuroSpeak User", email: r.requester_email || "", avatar: initials(r.requester_name, r.requester_email) })));
    } catch (error) {
      console.error("Loading chat contacts failed:", error);
      toast({ title: "Could not load contacts", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => { void loadContacts(); }, [loadContacts]);

  const acceptRequest = async (request: IncomingRequest) => {
    if (!userId) return;
    try {
      const { error } = await db.from("connection_requests").update({ status: "accepted" }).eq("id", request.id).eq("recipient_id", userId);
      if (error) throw error;
      await loadContacts();
      toast({ title: "Contact added", description: `${request.name} is now in your contacts.` });
    } catch (error) {
      toast({ title: "Could not accept request", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const rejectRequest = async (request: IncomingRequest) => {
    if (!userId) return;
    try {
      const { error } = await db.from("connection_requests").update({ status: "rejected" }).eq("id", request.id).eq("recipient_id", userId);
      if (error) throw error;
      await loadContacts();
    } catch (error) {
      toast({ title: "Could not reject request", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const openChat = async (contact: Contact) => {
    if (!userId) return;
    try {
      const { data, error } = await db.rpc("get_or_create_chat_conversation", { other_user_id: contact.id });
      if (error) throw error;
      const id = typeof data === "string" ? data : data?.[0]?.id ?? data?.id;
      if (!id) throw new Error("Conversation could not be created.");
      setConversationId(id);
      setActiveChat(contact.id);
    } catch (error) {
      toast({ title: "Could not open chat", description: error instanceof Error ? error.message : "Make sure the contact request is accepted." });
    }
  };

  useEffect(() => {
    if (!conversationId || !userId) { setMessages([]); return; }
    let cancelled = false;
    const loadMessages = async () => {
      const { data, error } = await db.from("chat_messages").select("id,content,sender_id,status,created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) { toast({ title: "Could not load messages", description: error.message }); return; }
      if (!cancelled) setMessages((data ?? []).map((m: any) => ({ id: m.id, text: m.content, sender: m.sender_id === userId ? "user" : "other", time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: m.status })));
    };
    void loadMessages();
    const channel = supabase.channel(`chat-messages:${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      const m: any = payload.new;
      setMessages((prev) => prev.some((item) => item.id === m.id) ? prev : [...prev, { id: m.id, text: m.content, sender: m.sender_id === userId ? "user" : "other", time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: m.status }]);
    }).subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [conversationId, userId, toast]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || !userId || !conversationId) return;
    setInputText("");
    const { error } = await db.from("chat_messages").insert({ conversation_id: conversationId, sender_id: userId, content: clean, status: "sent" });
    if (error) {
      setInputText(clean);
      toast({ title: "Message not sent", description: error.message });
    }
  };

  const startCall = (type: "voice" | "video") => {
    if (!activeContact) return;
    const contact: CallContact = { id: activeContact.id, name: activeContact.name, avatar: activeContact.avatar, role: activeContact.role };
    call.startCall(contact, type);
  };

  const quickPhrases = ["I need help", "Yes", "No", "Thank you", "I am okay", "I feel pain"];

  return (
    <MobileLayout role={role}>
      <AnimatePresence>{showAddContact && <AddContactSheet onClose={() => setShowAddContact(false)} currentUserId={userId} onChanged={loadContacts} role={role} />}</AnimatePresence>
      <CallOverlay callState={call.callState} callType={call.callType} contact={call.contact} duration={call.duration} isMuted={call.isMuted} isSpeakerOn={call.isSpeakerOn} isCameraOn={call.isCameraOn} onAccept={call.acceptCall} onDecline={call.declineCall} onEnd={call.endCall} onToggleMute={call.toggleMute} onToggleSpeaker={call.toggleSpeaker} onToggleCamera={call.toggleCamera} />

      {!activeChat ? <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-4 sm:px-5 lg:px-6 lg:pb-6">
        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Messages</h1><p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">Your conversations</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setShowRequests((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground sm:h-10 sm:w-10" aria-label="Contact requests"><UserCircle className="h-4 w-4" />{pendingRequests.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">{pendingRequests.length > 9 ? "9+" : pendingRequests.length}</span>}</button><button type="button" onClick={() => { haptics.light(); setShowAddContact(true); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10" aria-label="Add contact"><Plus className="h-4 w-4 sm:h-5 sm:w-5" /></button></div></div>
        <AnimatePresence>{showRequests && pendingRequests.length > 0 && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">{pendingRequests.map((request) => <div key={request.id} className="rounded-2xl border border-border bg-card p-3 shadow-card"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{request.avatar}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground">{request.name}</p><p className="truncate text-[10px] text-muted-foreground">{request.email}</p></div></div><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => void rejectRequest(request)} className="h-9 rounded-xl border border-border text-xs font-semibold">Reject</button><button type="button" onClick={() => void acceptRequest(request)} className="h-9 rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">Accept</button></div></div>)}</motion.div>}</AnimatePresence>
        {loading ? <div className="flex min-h-[52dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : contacts.length === 0 ? <div className="flex min-h-[52dvh] flex-col items-center justify-center px-4 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><MessagesSquare className="h-6 w-6 text-primary" /></div><h2 className="mt-4 text-sm font-bold text-foreground sm:text-base">No contacts yet</h2><p className="mt-1.5 max-w-[280px] text-[11px] leading-5 text-muted-foreground">Add a NeuroSpeak user using the + button above.</p><button type="button" onClick={() => setShowAddContact(true)} className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-xs font-bold text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add Contact</button></div> : <div className="mt-4 grid gap-2">{contacts.map((contact) => <motion.button key={contact.id} type="button" onClick={() => void openChat(contact)} className="flex min-h-[68px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card px-3 py-2.5 text-left shadow-card transition hover:border-primary/30"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{contact.avatar}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-card-foreground sm:text-sm">{contact.name}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{contact.role}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{contact.lastMessage}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" /></motion.button>)}</div>}
      </div> : <div className="flex min-h-[calc(100dvh-5rem)] w-full min-w-0 max-w-full flex-col overflow-hidden lg:min-h-[calc(100dvh-2rem)]">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card/90 px-3 py-2.5 backdrop-blur sm:px-28"><button type="button" onClick={() => { setActiveChat(null); setConversationId(null); tts.stop(); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary" aria-label="Back to contacts"><ArrowLeft className="h-5 w-5" /></button><button type="button" onClick={() => setShowParticipantSheet(true)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{activeContact?.avatar}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-foreground">{activeContact?.name}</p><p className="truncate text-[9px] text-muted-foreground">{activeContact?.role}</p></div></button><button type="button" onClick={() => startCall("voice")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-label="Voice call"><Phone className="h-4 w-4" /></button><button type="button" onClick={() => startCall("video")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-label="Video call"><Video className="h-4 w-4" /></button></div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">{messages.length === 0 && <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-4 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><MessagesSquare className="h-6 w-6 text-primary" /></div><p className="mt-3 text-sm font-bold text-foreground">{activeContact?.name}</p><p className="mt-1 max-w-[260px] text-[11px] leading-5 text-muted-foreground">Send a message to start the conversation</p></div>}<div className="space-y-2.5">{messages.map((msg) => <div key={msg.id} className={cn("flex min-w-0", msg.sender === "user" ? "justify-end" : "justify-start")}><div className="min-w-0 max-w-[82%] sm:max-w-[75%]"><div className={cn("break-words rounded-2xl px-3 py-2.5", msg.sender === "user" ? "rounded-br-sm bg-gradient-primary text-primary-foreground" : "rounded-bl-sm border border-border bg-card text-card-foreground")}><p className="break-words text-xs leading-5 sm:text-sm">{msg.text}</p></div><div className={cn("mt-1 flex items-center gap-1.5", msg.sender === "user" && "justify-end")}><span className="text-[9px] text-muted-foreground">{msg.time}</span><button type="button" onClick={() => tts.speak(msg.text)} className="rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Speak message"><Volume2 className="h-3 w-3" /></button>{msg.sender === "user" && <>{msg.status === "read" ? <Check className="h-3 w-3 text-primary" /> : <CheckCircle2 className="h-3 w-3 text-muted-foreground" />}</>}</div></div></div>)}</div><div ref={endRef} /></div>
        <div className="shrink-0 border-t border-border bg-card/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:px-4"><div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-2">{quickPhrases.map((phrase) => <button key={phrase} type="button" onClick={() => void sendMessage(phrase)} className="h-8 shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-3 text-[10px] font-semibold text-primary">{phrase}</button>)}</div><div className="flex min-w-0 items-end gap-2"><button type="button" onClick={() => setIsRecording((v) => !v)} className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", isRecording ? "border-destructive bg-destructive text-destructive-foreground" : "border-border bg-muted text-muted-foreground")} aria-label={isRecording ? "Stop recording" : "Start voice input"}>{isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button><textarea rows={1} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(inputText); } }} placeholder="Type a message..." aria-label="Message" className="block min-h-10 min-w-0 flex-1 resize-none overflow-y-auto rounded-2xl border border-border bg-muted px-3.5 py-2.5 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:text-sm" /><button type="button" onClick={() => void sendMessage(inputText)} disabled={!inputText.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-card disabled:opacity-35" aria-label="Send message"><Send className="h-4 w-4 text-primary-foreground" /></button></div></div>
      </div>}

      <AnimatePresence>{showParticipantSheet && activeContact && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] flex items-end bg-black/40" onClick={() => setShowParticipantSheet(false)}><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl bg-card p-5"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold text-primary-foreground">{activeContact.avatar}</div><div className="min-w-0 flex-1"><h2 className="truncate font-bold text-foreground">{activeContact.name}</h2><p className="text-xs text-muted-foreground">{activeContact.role}</p></div><button type="button" onClick={() => setShowParticipantSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"><X className="h-4 w-4" /></button></div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { startCall("voice"); setShowParticipantSheet(false); }} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 text-xs font-bold text-primary"><Phone className="h-4 w-4" />Voice Call</button><button type="button" onClick={() => { startCall("video"); setShowParticipantSheet(false); }} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 text-xs font-bold text-primary"><Video className="h-4 w-4" />Video Call</button></div></motion.div></motion.div>}</AnimatePresence>
    </MobileLayout>
  );
};

export default ChatScreen;
