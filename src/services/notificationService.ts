/**
 * notificationService.ts
 *
 * TODO (backend): Tables `notifications`, `sos_events` don't exist in the Supabase schema yet.
 *   After running `supabase gen types`, replace `untypedSupabase` with `supabase`.
 */
import { untypedSupabase as supabase } from "@/integrations/supabase/client";

class NotificationService {
  /**
   * Create Notification
   */
  async createNotification({
    caregiverId,
    patientId,
    title,
    body,
    type,
  }: {
    caregiverId: string;
    patientId: string;
    title: string;
    body: string;
    type: string;
  }) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        caregiver_id: caregiverId,
        patient_id: patientId,
        title,
        body,
        type,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Get Notifications
   */
  async getNotifications(caregiverId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("caregiver_id", caregiverId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Mark Notification as Read
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    if (error) throw error;
  }

  /**
   * Delete Notification
   */
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) throw error;
  }

  /**
   * Subscribe to Realtime Notifications
   */
  subscribeToNotifications(
    caregiverId: string,
    callback: (notification: any) => void,
  ) {
    return supabase
      .channel(`notifications-${caregiverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `caregiver_id=eq.${caregiverId}`,
        },
        (payload: { new: unknown }) => {
          callback(payload.new);
        },
      )
      .subscribe();
  }

  /**
   * Subscribe to SOS Events
   */
  subscribeToSOS(patientId: string, callback: (event: any) => void) {
    return supabase
      .channel(`sos-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sos_events",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload: { new: unknown }) => {
          callback(payload.new);
        },
      )
      .subscribe();
  }

  /**
   * Subscribe to Alerts
   */
  subscribeToAlerts(patientId: string, callback: (alert: any) => void) {
    return supabase
      .channel(`alerts-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload: { new: unknown }) => {
          callback(payload.new);
        },
      )
      .subscribe();
  }

  /**
   * Trigger SOS
   */
  async triggerSOS(patientId: string, latitude: number, longitude: number) {
    const { data, error } = await supabase
      .from("sos_events")
      .insert({
        patient_id: patientId,
        latitude,
        longitude,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Get Active SOS Events
   */
  async getActiveSOS(patientId: string) {
    const { data, error } = await supabase
      .from("sos_events")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  /**
   * Resolve SOS
   */
  async resolveSOS(sosId: string) {
    const { error } = await supabase
      .from("sos_events")
      .update({
        status: "resolved",
      })
      .eq("id", sosId);

    if (error) throw error;
  }
}

export default new NotificationService();
