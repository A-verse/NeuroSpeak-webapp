/**
 * locationService.ts
 *
 * Uses the browser Geolocation API (navigator.geolocation) as the web implementation.
 *
 * TODO (native): Swap import to @capacitor/geolocation for native iOS/Android builds.
 *   import { Geolocation } from "@capacitor/geolocation";
 *
 * TODO (backend): Tables `live_locations` don't exist in the Supabase schema yet.
 *   After running `supabase gen types`, replace `untypedSupabase` with `supabase`.
 */
import { untypedSupabase as supabase } from "@/integrations/supabase/client";

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading: number;
}

class LocationService {
  private watchId: number | null = null;

  /**
   * Request GPS Permission — web always prompts; returns true or throws.
   */
  async requestPermission(): Promise<true> {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation is not supported by this browser.");
    }
    // Browser permission is requested implicitly on first getCurrentPosition call.
    return true;
  }

  /**
   * Get Current GPS Location using browser Geolocation API.
   */
  getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed ?? 0,
            heading: position.coords.heading ?? 0,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Save latest location to Supabase via Edge Function.
   * TODO (backend): Edge Function `update-location` must exist.
   */
  async updateLocation(patientId: string): Promise<LocationResult> {
    const location = await this.getCurrentLocation();
    const { error } = await supabase.functions.invoke("update-location", {
      body: {
        patient_id: patientId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
      },
    });
    if (error) throw error;
    return location;
  }

  /**
   * Start Live Tracking with browser watchPosition.
   * TODO (backend): `live_locations` table must exist in Supabase.
   */
  startTracking(patientId: string): void {
    if (!("geolocation" in navigator)) return;
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { coords } = position;
        await supabase.from("live_locations").upsert({
          patient_id: patientId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed ?? 0,
          heading: coords.heading ?? 0,
          updated_at: new Date().toISOString(),
        });
      },
      (err) => console.error("watchPosition error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  /**
   * Stop Tracking.
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Subscribe Caregiver to Live Location Updates via Supabase Realtime.
   * TODO (backend): `live_locations` table must exist.
   */
  subscribeToLocation(patientId: string, callback: (location: unknown) => void) {
    return supabase
      .channel(`patient-location-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
          filter: `patient_id=eq.${patientId}`,
        },
        (payload: { new: unknown }) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
}

export default new LocationService();
