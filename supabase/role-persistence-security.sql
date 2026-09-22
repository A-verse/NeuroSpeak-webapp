-- NeuroSpeak role persistence + security patch
-- Run this once in Supabase Dashboard -> SQL Editor.
-- This does NOT change the existing schema or create new tables.

-- Keep the existing signup trigger, but ensure a valid role is written.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'caregiver' THEN 'caregiver'::user_role
      ELSE 'user'::user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Recreate the auth trigger safely.
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Prevent a signed-in user from changing their own role through the client.
-- The signup trigger runs without an authenticated user, so it can create the
-- initial role. Service-role/server-side operations also remain possible.
CREATE OR REPLACE FUNCTION public.prevent_client_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND auth.uid() = OLD.id
     AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Role changes are not allowed from the client';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_client_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_client_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_role_change();

-- Repair any profile rows whose role is NULL/impossible is unnecessary because
-- profiles.role is already NOT NULL with the existing user_role enum.
-- Existing valid caregiver/user roles are preserved.

-- Verification query: should return each authenticated profile's persisted role.
-- SELECT id, email, role FROM public.profiles ORDER BY created_at DESC;
