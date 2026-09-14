import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  AlertTriangle,
  LocateFixed,
  MapPin,
  RefreshCw,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";

import type {
  GeolocationPosition,
  PermissionState,
} from "@/hooks/useGeolocation";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  mode: "self" | "caregiver";
  position: GeolocationPosition | null;
  permissionState: PermissionState;
  isStale?: boolean;
  lastUpdated?: Date | null;
  onRequestPermission?: () => void;
  onRecenter?: () => void;
  onShare?: () => void;
  className?: string;
}

interface RecenterMapProps {
  position: GeolocationPosition;
}

function RecenterMap({ position }: RecenterMapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], 15, {
      animate: true,
    });
  }, [map, position.lat, position.lng]);

  return null;
}

function createNeuroSpeakIcon() {
  return L.divIcon({
    className: "neurospeak-map-marker",
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 58px;
      ">
        <div style="
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          background: hsl(174 58% 32%);
          border: 3px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 17px;
          font-weight: 700;
        ">
          N
        </div>

        <div style="
          position: absolute;
          left: 50%;
          top: 34px;
          transform: translateX(-50%) rotate(45deg);
          width: 13px;
          height: 13px;
          background: hsl(174 58% 32%);
          border-right: 3px solid white;
          border-bottom: 3px solid white;
        ">
        </div>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 50],
    popupAnchor: [0, -48],
  });
}

const neuroSpeakIcon = createNeuroSpeakIcon();

function formatUpdatedTime(date?: Date | null) {
  if (!date) return "Waiting for update";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes === 1) return "Updated 1 min ago";

  return `Updated ${minutes} min ago`;
}

export default function MapView({
  mode,
  position,
  permissionState,
  isStale = false,
  lastUpdated,
  onRequestPermission,
  onRecenter,
  onShare,
  className = "",
}: MapViewProps) {
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  if (permissionState === "denied") {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center ${className}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <MapPin className="h-6 w-6 text-destructive" />
        </div>

        <div className="mt-3">
          <p className="font-semibold text-foreground">
            Location access denied
          </p>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {mode === "self"
              ? "Enable location access in your device or browser settings."
              : "The patient's location is currently unavailable."}
          </p>
        </div>

        {mode === "self" && onRequestPermission && (
          <button
            type="button"
            onClick={onRequestPermission}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  if (permissionState === "idle" || permissionState === "requesting") {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border bg-accent/30 p-6 text-center ${className}`}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
        >
          <MapPin className="h-6 w-6 text-primary" />
        </motion.div>

        {permissionState === "requesting" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Requesting location…
          </p>
        ) : (
          <>
            <div className="mt-3">
              <p className="font-semibold text-foreground">
                {mode === "self"
                  ? "Share your location"
                  : "Patient location"}
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {mode === "self"
                  ? "Allow location access to see your position on the map."
                  : "Waiting for the patient's device to share a position."}
              </p>
            </div>

            {mode === "self" && onRequestPermission && (
              <button
                type="button"
                onClick={onRequestPermission}
                className="mt-4 h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Enable location
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  if (permissionState === "unavailable") {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-warning/20 bg-warning/5 p-6 text-center ${className}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
          <AlertTriangle className="h-6 w-6 text-warning" />
        </div>

        <div className="mt-3">
          <p className="font-semibold text-foreground">
            Location unavailable
          </p>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {mode === "caregiver"
              ? "The patient's location is currently unavailable."
              : "We couldn't determine your current location."}
          </p>
        </div>

        {onRequestPermission && (
          <button
            type="button"
            onClick={onRequestPermission}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (mode === "caregiver" && !position) {
    return (
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center ${className}`}
      >
        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
        >
          <MapPin className="h-6 w-6 text-primary" />
        </motion.div>

        <div className="mt-3">
          <p className="font-semibold text-foreground">
            Awaiting patient location
          </p>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The location will appear here once the patient's device shares it.
          </p>
        </div>
      </div>
    );
  }

  const center: [number, number] = position
    ? [position.lat, position.lng]
    : defaultCenter;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-border bg-muted shadow-sm ${className}`}
    >
      <MapContainer
        center={center}
        zoom={position ? 15 : 5}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        style={{
          minHeight: "280px",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {position && (
          <>
            <RecenterMap position={position} />

            <Circle
              center={[position.lat, position.lng]}
              radius={position.accuracy || 30}
              pathOptions={{
                color: "hsl(174 58% 32%)",
                fillColor: "hsl(174 58% 32%)",
                fillOpacity: 0.08,
                weight: 1,
              }}
            />

            <Marker
              position={[position.lat, position.lng]}
              icon={neuroSpeakIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <p className="font-semibold">
                    {mode === "self"
                      ? "Your location"
                      : "Patient location"}
                  </p>

                  {position.accuracy && (
                    <p className="mt-1 text-xs text-gray-500">
                      Approx. accuracy ±
                      {Math.round(position.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Floating map actions */}
      {position && (
        <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              aria-label="Share location"
              title="Share location"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground shadow-elevated backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
            >
              <Share2 className="h-4 w-4 text-primary" />
            </button>
          )}

          {onRecenter && (
            <button
              type="button"
              onClick={onRecenter}
              aria-label="Re-center map"
              title="Re-center map"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground shadow-elevated backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
            >
              <LocateFixed className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      )}

      {/* Location status sheet */}
      {position && (
        <div className="absolute bottom-3 left-3 right-3 z-[500]">
          <div className="rounded-2xl border border-white/40 bg-card/95 p-3.5 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="absolute h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {mode === "self"
                      ? "Your location"
                      : "Patient location"}
                  </p>

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isStale ? "bg-warning" : "bg-success"
                      }`}
                  />
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isStale
                    ? `Location may be outdated · ${formatUpdatedTime(
                      lastUpdated
                    )}`
                    : formatUpdatedTime(lastUpdated)}
                </p>
              </div>

              {position.accuracy && (
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Accuracy
                  </p>

                  <p className="text-xs font-semibold text-foreground">
                    ±{Math.round(position.accuracy)}m
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map attribution */}
      <div className="pointer-events-none absolute bottom-1 left-2 z-[500] text-[8px] text-foreground/40">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}