import MobileLayout from "@/components/MobileLayout";
import MapView from "@/components/MapView";
import { motion } from "framer-motion";
import {
  MapPin,
  UserCircle,
  Watch,
  Activity,
  WifiOff,
} from "lucide-react";

const CaregiverTracking = () => {
  // Real patient location will come from the backend/realtime subscription.
  // Never display fabricated coordinates.
  const patientPosition = null;
  const permissionState = "idle" as const;

  return (
    <MobileLayout role="caregiver">
      <div
        className="
          min-h-full
          w-full
          min-w-0
          overflow-x-hidden
          px-4
          py-4
          sm:px-6
          sm:py-6
          lg:mx-auto
          lg:max-w-5xl
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-4"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary/10
              "
            >
              <MapPin className="h-4.5 w-4.5 text-primary" />
            </div>

            <div className="min-w-0">
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-foreground
                  sm:text-2xl
                "
              >
                Live Tracking
              </h1>

              <p className="text-[10px] text-muted-foreground sm:text-xs">
                Patient location and activity
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            PATIENT STATUS
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.06,
          }}
          className="
            mb-3
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-border
            bg-card
            p-3
            shadow-card
            sm:p-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
            "
          >
            <UserCircle className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-card-foreground sm:text-sm">
              Patient
            </p>

            <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
              Waiting for location sharing
            </p>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              bg-muted
              px-2
              py-1
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />

            <span className="text-[8px] font-medium text-muted-foreground sm:text-[9px]">
              Offline
            </span>
          </div>
        </motion.div>

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
            delay: 0.1,
          }}
          className="
            mb-3
            overflow-hidden
            rounded-2xl
            border
            border-border
            shadow-card
          "
        >
          <MapView
            mode="caregiver"
            position={patientPosition}
            permissionState={permissionState}
            className="
              h-60
              w-full
              sm:h-72
              lg:h-[360px]
            "
          />
        </motion.div>

        {/* ============================================================
            LOCATION STATUS
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.16,
          }}
          className="
            mb-3
            rounded-2xl
            border
            border-border
            bg-card
            p-3
            shadow-card
            sm:p-4
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-muted
              "
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                Location Status
              </p>

              <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                No location data available
              </p>
            </div>

            <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </div>

          <div
            className="
              mt-3
              rounded-xl
              bg-muted/50
              px-3
              py-2.5
            "
          >
            <p className="text-[9px] leading-4 text-muted-foreground sm:text-[10px] sm:leading-5">
              The patient has not shared their location yet. Their
              location will appear here once location sharing is enabled.
            </p>
          </div>
        </motion.div>

        {/* ============================================================
            ACTIVITY
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.22,
          }}
          className="
            rounded-2xl
            border
            border-border
            bg-muted/50
            p-3
            sm:p-4
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-muted
              "
            >
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                Activity Data
              </p>

              <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                Waiting for a connected health source
              </p>
            </div>

            <Watch className="h-4 w-4 text-muted-foreground/50" />
          </div>

          <div
            className="
              mt-3
              rounded-xl
              border
              border-dashed
              border-border
              px-3
              py-3
              text-center
            "
          >
            <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
              No wearable data available
            </p>

            <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground sm:text-[9px]">
              Activity metrics will appear when the patient connects
              a supported wearable or health source.
            </p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default CaregiverTracking;