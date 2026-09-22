import MobileLayout from "@/components/MobileLayout";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityTimelineProps {
  role: "user" | "caregiver";
}

const ActivityTimeline = ({
  role,
}: ActivityTimelineProps) => {
  const navigate = useNavigate();

  return (
    <MobileLayout role={role}>
      <div
        className="
          mx-auto
          flex
          min-h-[calc(100dvh-5rem)]
          w-full
          max-w-3xl
          min-w-0
          flex-col
          overflow-x-hidden
          px-4
          pb-20
          pt-4
          sm:px-5
          lg:min-h-[calc(100dvh-2rem)]
          lg:px-6
          lg:pb-6
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
              transition
              hover:bg-primary/20
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1
              className="
                truncate
                text-xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-2xl
              "
            >
              Activity Timeline
            </h1>

            <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
              Your recent activity
            </p>
          </div>
        </div>

        {/* ============================================================
            EMPTY STATE
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
            duration: 0.25,
          }}
          className="
            flex
            flex-1
            flex-col
            items-center
            justify-center
            px-5
            py-10
            text-center
          "
        >
          {/* Icon */}

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
            "
          >
            <Activity className="h-6 w-6 text-primary/60" />
          </div>

          {/* Title */}

          <p
            className="
              mt-4
              text-sm
              font-bold
              text-foreground
            "
          >
            No activity yet
          </p>

          {/* Description */}

          <p
            className="
              mt-1.5
              max-w-sm
              text-[11px]
              leading-5
              text-muted-foreground
              sm:text-xs
            "
          >
            Communication activity, SOS events,
            alerts, and wearable data will appear
            here when available.
          </p>

          {/* Status */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-1.5
              rounded-full
              bg-muted
              px-3
              py-1.5
              text-[9px]
              text-muted-foreground
            "
          >
            <Clock className="h-3 w-3" />

            <span>
              Waiting for activity data
            </span>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default ActivityTimeline;