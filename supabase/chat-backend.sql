-- NeuroSpeak communication chat backend.
-- Safe to run after database.sql + role-persistence-security.sql.
-- Uses separate chat tables so communication contacts cannot be confused with
-- caregiver_patient health authorization or the existing health conversations.

CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connection_requests_not_self CHECK (requester_id <> recipient_id),
  CONSTRAINT connection_requests_unique_pair UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient ON public.connection_requests(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester ON public.connection_requests(requester_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_connection_requests_unordered_pair
ON public.connection_requests (LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id));

CREATE OR REPLACE FUNCTION public.touch_connection_request_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_connection_requests_updated_at ON public.connection_requests;
CREATE TRIGGER trg_connection_requests_updated_at
BEFORE UPDATE ON public.connection_requests
FOR EACH ROW EXECUTE FUNCTION public.touch_connection_request_updated_at();

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "connection_requests_select_participant" ON public.connection_requests;
CREATE POLICY "connection_requests_select_participant"
ON public.connection_requests FOR SELECT TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "connection_requests_insert_self" ON public.connection_requests;
CREATE POLICY "connection_requests_insert_self"
ON public.connection_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requester_id AND requester_id <> recipient_id);

DROP POLICY IF EXISTS "connection_requests_update_participant" ON public.connection_requests;
CREATE POLICY "connection_requests_update_participant"
ON public.connection_requests FOR UPDATE TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = recipient_id)
WITH CHECK (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chat_conversations_not_self CHECK (participant_one <> participant_two),
  CONSTRAINT chat_conversations_canonical_pair CHECK (participant_one < participant_two),
  CONSTRAINT chat_conversations_unique_pair UNIQUE (participant_one, participant_two)
);

CREATE INDEX IF NOT EXISTS idx_chat_conv_p1 ON public.chat_conversations(participant_one);
CREATE INDEX IF NOT EXISTS idx_chat_conv_p2 ON public.chat_conversations(participant_two);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','delivered','read')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at ASC);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_conversations_select_participant" ON public.chat_conversations;
CREATE POLICY "chat_conversations_select_participant"
ON public.chat_conversations FOR SELECT TO authenticated
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

DROP POLICY IF EXISTS "chat_messages_select_participant" ON public.chat_messages;
CREATE POLICY "chat_messages_select_participant"
ON public.chat_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = chat_messages.conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
));

DROP POLICY IF EXISTS "chat_messages_insert_sender" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_sender"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

DROP POLICY IF EXISTS "chat_messages_update_participant" ON public.chat_messages;
CREATE POLICY "chat_messages_update_participant"
ON public.chat_messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = chat_messages.conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = chat_messages.conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
));

CREATE OR REPLACE FUNCTION public.find_chat_profile_by_email(target_email TEXT)
RETURNS TABLE(id UUID, full_name TEXT, avatar_url TEXT, email TEXT, role public.user_role)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.email, p.role
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND lower(p.email) = lower(trim(target_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_chat_profile_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_chat_profile_by_email(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_chat_contacts()
RETURNS TABLE(id UUID, full_name TEXT, avatar_url TEXT, email TEXT, role public.user_role)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.email, p.role
  FROM public.connection_requests r
  JOIN public.profiles p ON p.id = CASE WHEN r.requester_id = auth.uid() THEN r.recipient_id ELSE r.requester_id END
  WHERE auth.uid() IS NOT NULL
    AND r.status = 'accepted'
    AND (r.requester_id = auth.uid() OR r.recipient_id = auth.uid())
  ORDER BY p.full_name NULLS LAST, p.email;
$$;

REVOKE ALL ON FUNCTION public.get_chat_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_chat_contacts() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_incoming_chat_requests()
RETURNS TABLE(id UUID, requester_id UUID, requester_name TEXT, requester_email TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.requester_id, p.full_name, p.email
  FROM public.connection_requests r
  JOIN public.profiles p ON p.id = r.requester_id
  WHERE auth.uid() IS NOT NULL
    AND r.recipient_id = auth.uid()
    AND r.status = 'pending'
  ORDER BY r.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_incoming_chat_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_incoming_chat_requests() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_chat_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me UUID := auth.uid();
  a UUID;
  b UUID;
  conversation_id UUID;
BEGIN
  IF me IS NULL OR other_user_id IS NULL OR me = other_user_id THEN
    RAISE EXCEPTION 'Invalid chat participant';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.connection_requests r
    WHERE r.status = 'accepted'
      AND ((r.requester_id = me AND r.recipient_id = other_user_id)
        OR (r.requester_id = other_user_id AND r.recipient_id = me))
  ) THEN
    RAISE EXCEPTION 'Chat is only available for accepted contacts';
  END IF;

  IF me < other_user_id THEN a := me; b := other_user_id;
  ELSE a := other_user_id; b := me;
  END IF;

  SELECT id INTO conversation_id
  FROM public.chat_conversations
  WHERE participant_one = a AND participant_two = b;

  IF conversation_id IS NULL THEN
    INSERT INTO public.chat_conversations(participant_one, participant_two)
    VALUES (a, b)
    ON CONFLICT (participant_one, participant_two) DO NOTHING
    RETURNING id INTO conversation_id;

    IF conversation_id IS NULL THEN
      SELECT id INTO conversation_id FROM public.chat_conversations WHERE participant_one = a AND participant_two = b;
    END IF;
  END IF;

  RETURN conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_chat_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_chat_conversation(UUID) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;
