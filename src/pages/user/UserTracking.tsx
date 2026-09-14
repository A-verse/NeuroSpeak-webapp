import MobileLayout from "@/components/MobileLayout";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";
import {
  MapPin,
  Activity,
  Watch,
  Clock3,
  Share2,
  Check,
  LocateFixed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UserTracking = () => {
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [isShared, setIsShared] =
    useState(false);

  const handleShareLocation = async () => {
    if (!geo.position) return;

    const { lat, lng } = geo.position;

    const locationUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Location",
          text: "Here is my current location.",
          url: locationUrl,
        });

        setIsShared(true);

        window.setTimeout(() => {
          setIsShared(false);
        }, 2000);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          locationUrl,
        );

        setIsShared(true);

        window.setTimeout(() => {
          setIsShared(false);
        }, 2000);
      }
    } catch {
      // User closed the share sheet.
    }
  };

  return (
    <MobileLayout role="user">
      <div
        className="
          mx-auto
          w-full
          max-w-4xl
          min-w-0
          overflow-x-hidden
          px-4
          pb-20
          pt-4
          sm:px-5
          lg:px-6
          lg:pb-5
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="mb-3">
          <h1
            className="
              text-xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-2xl
            "
          >
            My Location
          </h1>

          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            Your current location
          </p>
        </div>

        {/* ============================================================
            MAP
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.99,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.25,
          }}
          className="
            relative
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          <MapView
            mode="self"
            position={geo.position}
            permissionState={
              geo.permissionState
            }
            isStale={geo.isStale}
            lastUpdated={
              geo.lastUpdated
            }
            onRequestPermission={
              geo.requestPermission
            }
            onRecenter={
              geo.requestPermission
            }
            className="
              h-[43dvh]
              min-h-[225px]
              max-h-[340px]
              w-full
              sm:h-[315px]
              lg:h-[350px]
            "
          />

          {/* ==========================================================
              MAP CONTROLS
          ========================================================== */}

          {geo.position && (
            <div
              className="
                absolute
                right-3
                top-3
                z-[500]
                flex
                flex-col
                gap-2
              "
            >
              {/* Share */}
              <button
                type="button"
                onClick={
                  handleShareLocation
                }
                aria-label="Share location"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/40
                  bg-background/90
                  text-primary
                  shadow-lg
                  backdrop-blur
                  transition
                  hover:bg-background
                  active:scale-95
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary
                "
              >
                {isShared ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>

              {/* Recenter */}
              {geo.permissionState ===
                "granted" && (
                  <button
                    type="button"
                    onClick={
                      geo.requestPermission
                    }
                    aria-label="Center on my location"
                    className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/40
                    bg-background/90
                    text-primary
                    shadow-lg
                    backdrop-blur
                    transition
                    hover:bg-background
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  "
                  >
                    <LocateFixed className="h-4 w-4" />
                  </button>
                )}
            </div>
          )}
        </motion.div>

        {/* ============================================================
            LOCATION INFO
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="
            mt-2
            flex
            min-w-0
            items-center
            gap-3
            rounded-xl
            border
            border-border
            bg-card
            px-3
            py-2.5
            shadow-card
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
            "
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </div>

          {geo.position ? (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground sm:text-xs">
                Current location
              </p>

              <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                Location detected successfully
              </p>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground sm:text-xs">
                Location unavailable
              </p>

              <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                Allow location access to continue
              </p>
            </div>
          )}

          {geo.position && (
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-medium text-foreground">
                ±
                {Math.round(
                  geo.position.accuracy,
                )}
                m
              </p>

              <p className="text-[8px] text-muted-foreground">
                accuracy
              </p>
            </div>
          )}
        </motion.div>

        {/* ============================================================
            LAST UPDATED
        ============================================================ */}

        {geo.lastUpdated && (
          <div
            className="
              mt-1.5
              flex
              items-center
              justify-center
              gap-1
              text-[8px]
              text-muted-foreground
            "
          >
            <Clock3 className="h-2.5 w-2.5" />

            <span>
              Updated{" "}
              {geo.lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </span>

            {geo.isStale && (
              <span className="ml-1 font-medium text-amber-600">
                • Stale
              </span>
            )}
          </div>
        )}

        {/* ============================================================
            WEARABLE
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.14,
          }}
          className="
            mt-3
            flex
            min-w-0
            items-center
            gap-3
            rounded-xl
            border
            border-border
            bg-card
            p-3
            shadow-card
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-muted
            "
          >
            <Watch className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-muted-foreground" />

              <p className="text-xs font-semibold text-card-foreground">
                Activity Tracking
              </p>
            </div>

            <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
              No wearable device connected
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/wearable/setup",
              )
            }
            className="
              shrink-0
              rounded-lg
              bg-primary/10
              px-3
              py-2
              text-[9px]
              font-semibold
              text-primary
              transition
              hover:bg-primary/20
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
            "
          >
            Set Up
          </button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default UserTracking;