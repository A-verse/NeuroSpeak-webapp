import { supabase } from "@/integrations/supabase/client";

export type AppUserRole = "user" | "caregiver";

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: AppUserRole,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function getPersistedRole(userId: string): Promise<AppUserRole | null> {
  const { data, error } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load persisted role:", error);
    return null;
  }

  const role = (data as { role?: unknown } | null)?.role;
  return role === "caregiver" || role === "user" ? role : null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const role = data.user ? await getPersistedRole(data.user.id) : null;
  return { ...data, role };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
