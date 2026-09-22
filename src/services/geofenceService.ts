/**
 * geofenceService.ts
 *
 * TODO (backend): Tables `safe_zones`, `alerts` don't exist in the Supabase schema yet.
 *   After running `supabase gen types`, replace `untypedSupabase` with `supabase`.
 */
import { untypedSupabase as supabase } from "@/integrations/supabase/client";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface SafeZone {
  id: string;
  zone_name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

class GeofenceService {
  /**
   * Calculate distance between two GPS points (meters)
   */
  calculateDistance(point1: Coordinate, point2: Coordinate): number {
    const R = 6371000;

    const dLat = this.toRadians(point2.latitude - point1.latitude);

    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Degrees → Radians
   */
  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Check if patient is inside safe zone
   */
  isInsideSafeZone(location: Coordinate, safeZone: SafeZone): boolean {
    const distance = this.calculateDistance(location, {
      latitude: safeZone.latitude,
      longitude: safeZone.longitude,
    });

    return distance <= safeZone.radius;
  }

  /**
   * Get active safe zone
   */
  async getSafeZone(patientId: string) {
    const { data, error } = await supabase
      .from("safe_zones")
      .select("*")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Check geofence
   */
  async checkGeofence(patientId: string, latitude: number, longitude: number) {
    const safeZone = await this.getSafeZone(patientId);

    if (!safeZone) return;

    const inside = this.isInsideSafeZone(
      {
        latitude,
        longitude,
      },
      safeZone,
    );

    if (!inside) {
      await this.createAlert(patientId, safeZone.zone_name);
    }

    return inside;
  }

  /**
   * Create alert if patient exits safe zone
   */
  async createAlert(patientId: string, zoneName: string) {
    const { error } = await supabase.from("alerts").insert({
      patient_id: patientId,
      title: "Safe Zone Alert",
      message: `Patient left "${zoneName}"`,
      type: "geofence",
    });

    if (error) throw error;
  }

  /**
   * Create / Update safe zone
   */
  async saveSafeZone(
    patientId: string,
    zoneName: string,
    latitude: number,
    longitude: number,
    radius: number,
  ) {
    const { error } = await supabase.from("safe_zones").upsert({
      patient_id: patientId,
      zone_name: zoneName,
      latitude,
      longitude,
      radius,
      is_active: true,
    });

    if (error) throw error;
  }

  /**
   * Delete safe zone
   */
  async removeSafeZone(patientId: string) {
    const { error } = await supabase
      .from("safe_zones")
      .delete()
      .eq("patient_id", patientId);

    if (error) throw error;
  }
}

export default new GeofenceService();
