-- ============================================================
-- NeuroSpeak -- Supabase Database Schema
-- ============================================================
--
-- HOW TO APPLY:
--   1. Supabase Dashboard -> Database -> SQL Editor
--   2. New query, paste this file, click Run
--
-- After running:
--   a) Storage: create bucket "avatars"
--      (public: false, MIME: image/png, image/jpeg, image/webp, image/gif)
--   b) Set .env vars:
--      VITE_SUPABASE_URL             = https://<ref>.supabase.co
--      VITE_SUPABASE_PUBLISHABLE_KEY = <anon-public-key>
--   c) Optional: generate typed client
--      npx supabase gen types typescript --project-id <ref>
--        > src/integrations/supabase/types.ts
-- ============================================================


-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role           AS ENUM ('user', 'caregiver');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE relationship_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_status      AS ENUM ('sent', 'delivered', 'read');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sos_status          AS ENUM ('active', 'cancelled', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type   AS ENUM ('emergency', 'message', 'alert', 'health', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_level         AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS
'BEGIN NEW.updated_at = NOW(); RETURN NEW; END;';


-- ============================================================
-- TABLE: profiles
-- Auto-created from auth.users on signup via trigger below.
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role   NOT NULL DEFAULT 'user',
  full_name     TEXT,
  email         TEXT,
  avatar_url    TEXT,
  date_of_birth DATE,
  diagnosis     TEXT,
  language      TEXT        NOT NULL DEFAULT 'en',
  speech_rate   REAL        NOT NULL DEFAULT 0.9
                  CHECK (speech_rate BETWEEN 0.1 AND 2.0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS
'BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>''full_name'',
    NEW.raw_user_meta_data->>''avatar_url'',
    COALESCE((NEW.raw_user_meta_data->>''role'')::user_role, ''user'')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;';

CREATE OR REPLACE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TABLE: caregiver_patient
-- Links a caregiver profile to a patient profile.
-- ============================================================
CREATE TABLE IF NOT EXISTS caregiver_patient (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       relationship_status NOT NULL DEFAULT 'pending',
  invited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at  TIMESTAMPTZ,
  UNIQUE (caregiver_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_caregiver ON caregiver_patient(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_cp_patient   ON caregiver_patient(patient_id);


-- ============================================================
-- TABLE: emergency_contacts
-- Per-user SOS contact list (replaces current localStorage store).
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  relation   TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ec_user ON emergency_contacts(user_id);


-- ============================================================
-- TABLE: conversations
-- One conversation per patient-caregiver pair.
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, caregiver_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_patient   ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conv_caregiver ON conversations(caregiver_id);


-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  status          message_status NOT NULL DEFAULT 'sent',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_sender       ON messages(sender_id);


-- ============================================================
-- TABLE: notifications
-- In-app notification records (replaces in-memory NotificationContext).
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  entity_type TEXT,
  entity_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user      ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread    ON notifications(user_id, read) WHERE read = FALSE;


-- ============================================================
-- TABLE: sos_events
-- Records each emergency button press.
-- ============================================================
CREATE TABLE IF NOT EXISTS sos_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       sos_status NOT NULL DEFAULT 'active',
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sos_patient ON sos_events(patient_id, triggered_at DESC);


-- ============================================================
-- TABLE: alerts
-- Caregiver-facing alerts (future AI pipeline).
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  level        alert_level NOT NULL DEFAULT 'info',
  title        TEXT NOT NULL,
  description  TEXT,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_caregiver ON alerts(caregiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_patient   ON alerts(patient_id, created_at DESC);


-- ============================================================
-- TABLE: live_locations
-- Upserted on every GPS update from the patient device.
-- ============================================================
CREATE TABLE IF NOT EXISTS live_locations (
  patient_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  latitude   DOUBLE PRECISION NOT NULL,
  longitude  DOUBLE PRECISION NOT NULL,
  accuracy   REAL,
  speed      REAL,
  heading    REAL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: safe_zones (future)
-- Named geographic zones; alert when patient leaves radius.
-- ============================================================
CREATE TABLE IF NOT EXISTS safe_zones (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  latitude   DOUBLE PRECISION NOT NULL,
  longitude  DOUBLE PRECISION NOT NULL,
  radius_m   REAL NOT NULL DEFAULT 200,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sz_patient ON safe_zones(patient_id);


-- ============================================================
-- TABLE: app_settings
-- Per-user preferences (dark mode, font size, haptics).
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  dark_mode       BOOLEAN  NOT NULL DEFAULT FALSE,
  font_size       SMALLINT NOT NULL DEFAULT 16
                    CHECK (font_size BETWEEN 12 AND 32),
  haptics_enabled BOOLEAN  NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_patient  ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings       ENABLE ROW LEVEL SECURITY;


-- profiles
CREATE POLICY "profiles_own_select"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_caregiver_select"
  ON profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caregiver_patient
      WHERE caregiver_id = auth.uid()
        AND patient_id = profiles.id
        AND status = 'accepted'
    )
  );

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- caregiver_patient
CREATE POLICY "cp_own_rows"
  ON caregiver_patient FOR ALL
  USING (auth.uid() = caregiver_id OR auth.uid() = patient_id)
  WITH CHECK (auth.uid() = caregiver_id OR auth.uid() = patient_id);


-- emergency_contacts
CREATE POLICY "ec_own_rows"
  ON emergency_contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ec_caregiver_select"
  ON emergency_contacts FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caregiver_patient
      WHERE caregiver_id = auth.uid()
        AND patient_id = emergency_contacts.user_id
        AND status = 'accepted'
    )
  );


-- conversations
CREATE POLICY "conv_participants"
  ON conversations FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() = caregiver_id)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = caregiver_id);


-- messages
CREATE POLICY "msg_participants"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.patient_id = auth.uid() OR c.caregiver_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.patient_id = auth.uid() OR c.caregiver_id = auth.uid())
    )
  );


-- notifications
CREATE POLICY "notif_own_rows"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- sos_events
CREATE POLICY "sos_patient_all"
  ON sos_events FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "sos_caregiver_select"
  ON sos_events FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caregiver_patient
      WHERE caregiver_id = auth.uid()
        AND patient_id = sos_events.patient_id
        AND status = 'accepted'
    )
  );


-- alerts
CREATE POLICY "alerts_participants"
  ON alerts FOR ALL
  USING (auth.uid() = caregiver_id OR auth.uid() = patient_id)
  WITH CHECK (auth.uid() = caregiver_id);


-- live_locations
CREATE POLICY "loc_patient_all"
  ON live_locations FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "loc_caregiver_select"
  ON live_locations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caregiver_patient
      WHERE caregiver_id = auth.uid()
        AND patient_id = live_locations.patient_id
        AND status = 'accepted'
    )
  );


-- safe_zones
CREATE POLICY "sz_patient_all"
  ON safe_zones FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "sz_caregiver_select"
  ON safe_zones FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caregiver_patient
      WHERE caregiver_id = auth.uid()
        AND patient_id = safe_zones.patient_id
        AND status = 'accepted'
    )
  );


-- app_settings
CREATE POLICY "settings_own_rows"
  ON app_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- REALTIME
-- Enable live updates for key tables.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sos_events;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE live_locations;


-- ============================================================
-- STORAGE BUCKET: avatars
-- ============================================================
-- Option A: Create via Supabase Dashboard > Storage
--   Name: avatars, Public: false
--   Allowed MIME types: image/png, image/jpeg, image/webp, image/gif
--   Max upload size: 5242880 (5 MB)
--
-- Option B: Insert directly (run separately if pg_storage is available):
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('avatars', 'avatars', false)
--   ON CONFLICT DO NOTHING;
--
-- Storage RLS policies (Dashboard > Storage > avatars > Policies):
--   INSERT: (auth.uid()::text) = (storage.foldername(name))[1]
--   UPDATE: (auth.uid()::text) = (storage.foldername(name))[1]
--   SELECT: auth.role() = 'authenticated'
--
-- Upload path used by EditProfile.tsx: {userId}/avatar.{ext}
-- ============================================================


-- ============================================================
-- SUMMARY
-- ============================================================
-- Tables: profiles, caregiver_patient, emergency_contacts,
--         conversations, messages, notifications, sos_events,
--         alerts, live_locations, safe_zones, app_settings
-- RLS: enabled on all tables, per-role policies
-- Realtime: messages, notifications, sos_events, alerts, live_locations
-- Triggers: auto-profile creation, updated_at maintenance
-- ============================================================
