import { useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { supabase } from "@/integrations/supabase/client";

const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const setupRealtimeNotifications = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.user) {
        return;
      }

      const userId = session.user.id;

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (cancelled) return;

            const notification = payload.new as {
              type: string;
              title: string;
              body: string;
            };

            addNotification({
              type: notification.type as
                | "health"
                | "message"
                | "alert"
                | "system"
                | "emergency",
              title: notification.title,
              body: notification.body,
              roles: [],
            });
          }
        )
        .subscribe();

      if (cancelled && channel) {
        await supabase.removeChannel(channel);
        channel = null;
      }
    };

    setupRealtimeNotifications();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [addNotification]);
};

export default useRealtimeNotifications;