import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div
      className="
        flex
        h-[100dvh]
        min-h-0
        w-full
        min-w-0
        items-center
        justify-center
        overflow-hidden
        bg-background
        px-4
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          w-full
          max-w-md
          text-center
        "
      >
        {/* Icon */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.08,
          }}
          className="
            mx-auto
            mb-5
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-primary/10
          "
        >
          <Brain className="h-8 w-8 text-primary" />
        </motion.div>

        {/* Error */}

        <p
          className="
            text-5xl
            font-bold
            tracking-tight
            text-foreground
            sm:text-6xl
          "
        >
          404
        </p>

        <h1
          className="
            mt-2
            text-lg
            font-semibold
            text-foreground
            sm:text-xl
          "
        >
          Page not found
        </h1>

        <p
          className="
            mx-auto
            mt-1.5
            max-w-xs
            text-xs
            leading-5
            text-muted-foreground
            sm:text-sm
          "
        >
          The page you're looking for doesn't exist or may have
          been moved.
        </p>

        {/* Actions */}

        <div
          className="
            mt-6
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:justify-center
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card
              px-5
              text-xs
              font-semibold
              text-card-foreground
              shadow-card
              transition
              hover:border-primary/40
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:text-sm
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-primary
              px-5
              text-xs
              font-semibold
              text-primary-foreground
              shadow-card
              transition
              active:scale-[0.99]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              sm:text-sm
            "
          >
            <Home className="h-4 w-4" />
            Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;