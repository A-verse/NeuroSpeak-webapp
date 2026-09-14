import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import logo from "@/assets/neurospeak-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useApp();
  const [showTagline, setShowTagline] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTagline(true), 900);
    const t2 = setTimeout(() => {
      if (isLoggedIn && role) {
        navigate(role === "caregiver" ? "/caregiver" : "/user");
      } else {
        navigate("/landing");
      }
    }, 3400);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 40);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [navigate, isLoggedIn, role]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Particle-like ambient dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary-foreground/20"
          style={{ top: `${20 + i * 12}%`, left: `${15 + i * 13}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}

      {/* Expanding rings */}
      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full border border-primary-foreground/5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full border border-primary-foreground/[0.03]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute h-[800px] w-[800px] rounded-full border border-primary-foreground/[0.02]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.4 }}
      />

      {/* Logo container */}
      <motion.div className="relative z-10 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.8, 1.3] }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] h-28 w-28 rounded-full border-2 border-primary-foreground/10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />
        <motion.img
          src={logo}
          alt="NeuroSpeak Logo"
          className="h-24 w-24 mb-6 relative z-10 drop-shadow-lg"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        />
        <motion.h1
          className="text-3xl font-extrabold tracking-tight text-primary-foreground mb-1.5 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          NeuroSpeak
        </motion.h1>
        <motion.div
          className="h-0.5 w-12 bg-primary-foreground/30 rounded-full mb-3"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
        <motion.p
          className="text-primary-foreground/75 text-sm font-medium tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showTagline ? 1 : 0, y: showTagline ? 0 : 10 }}
          transition={{ duration: 0.5 }}
        >
          Voice Beyond Words
        </motion.p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-20 w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="w-full h-1 rounded-full bg-primary-foreground/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary-foreground/50" style={{ width: `${progress}%` }} />
        </div>
        <motion.p
          className="text-[10px] text-primary-foreground/40 text-center mt-2 font-medium tracking-wider uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Loading your experience
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
