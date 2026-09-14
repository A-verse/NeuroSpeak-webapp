import { supabase } from "@/integrations/supabase/client";
import { getPersistedRole } from "@/lib/auth";

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentRole() {
  const user = await getCurrentUser();
  return user ? await getPersistedRole(user.id) : null;
}
