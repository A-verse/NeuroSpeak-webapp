import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AppProvider, useApp, type UserRole } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToast from "@/components/NotificationToast";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "./pages/SplashScreen";
import Landing from "./pages/Landing";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/onboarding/Welcome";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import Permissions from "./pages/onboarding/Permissions";
import AccessibilitySetup from "./pages/onboarding/AccessibilitySetup";
import CommunicationPreferences from "./pages/onboarding/CommunicationPreferences";
import UserHome from "./pages/user/UserHome";
import CommunicationBoard from "./pages/user/CommunicationBoard";
import CustomPhraseBuilder from "./pages/user/CustomPhraseBuilder";
import ChatScreen from "./pages/user/ChatScreen";
import VoiceOutput from "./pages/user/VoiceOutput";
import UserTracking from "./pages/user/UserTracking";
import EmotionDashboard from "./pages/user/EmotionDashboard";
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";
import AIAnalysis from "./pages/caregiver/AIAnalysis";
import CaregiverTracking from "./pages/caregiver/CaregiverTracking";
import AlertsScreen from "./pages/shared/AlertsScreen";
import ProfileScreen from "./pages/shared/ProfileScreen";
import SettingsScreen from "./pages/shared/SettingsScreen";
import EditProfile from "./pages/shared/EditProfile";
import EmergencyContacts from "./pages/shared/EmergencyContacts";
import ActivityTimeline from "./pages/shared/ActivityTimeline";
import EmergencyScreen from "./pages/EmergencyScreen";
import WearableSetup from "./pages/wearable/WearableSetup";
import NotFound from "./pages/NotFound";
import RealtimeNotificationInit from "./components/RealtimeNotificationInit";

const queryClient = new QueryClient();

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const ProtectedRoute = ({ children, allowedRole }: {
  children: ReactNode;
  allowedRole?: Exclude<UserRole, null>;
}) => {
  const { isLoggedIn, isSessionLoading, role } = useApp();
  if (isSessionLoading) return <div className="min-h-screen bg-background" />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to={role === "caregiver" ? "/caregiver" : "/user"} replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition} className="min-h-screen">
        <Routes location={location}>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Onboarding */}
          <Route path="/onboarding/welcome" element={<Welcome />} />
          <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
          <Route path="/onboarding/permissions" element={<Permissions />} />
          <Route path="/onboarding/accessibility" element={<AccessibilitySetup />} />
          <Route path="/onboarding/communication" element={<CommunicationPreferences />} />

          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserHome /></ProtectedRoute>} />
          <Route path="/user/home" element={<ProtectedRoute allowedRole="user"><UserHome /></ProtectedRoute>} />
          <Route path="/user/communicate" element={<ProtectedRoute allowedRole="user"><CommunicationBoard /></ProtectedRoute>} />
          <Route path="/user/custom-phrases" element={<ProtectedRoute allowedRole="user"><CustomPhraseBuilder /></ProtectedRoute>} />
          <Route path="/user/chat" element={<ProtectedRoute allowedRole="user"><ChatScreen role="user" /></ProtectedRoute>} />
          <Route path="/user/voice" element={<ProtectedRoute allowedRole="user"><VoiceOutput /></ProtectedRoute>} />
          <Route path="/user/tracking" element={<ProtectedRoute allowedRole="user"><UserTracking /></ProtectedRoute>} />
          <Route path="/user/alerts" element={<ProtectedRoute allowedRole="user"><AlertsScreen role="user" /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRole="user"><ProfileScreen role="user" /></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute allowedRole="user"><SettingsScreen role="user" /></ProtectedRoute>} />
          <Route path="/user/edit-profile" element={<ProtectedRoute allowedRole="user"><EditProfile role="user" /></ProtectedRoute>} />
          <Route path="/user/emergency-contacts" element={<ProtectedRoute allowedRole="user"><EmergencyContacts role="user" /></ProtectedRoute>} />
          <Route path="/user/timeline" element={<ProtectedRoute allowedRole="user"><ActivityTimeline role="user" /></ProtectedRoute>} />

          {/* Caregiver Routes */}
          <Route path="/caregiver" element={<ProtectedRoute allowedRole="caregiver"><CaregiverDashboard /></ProtectedRoute>} />
          <Route path="/caregiver/dashboard" element={<ProtectedRoute allowedRole="caregiver"><CaregiverDashboard /></ProtectedRoute>} />
          <Route path="/caregiver/tracking" element={<ProtectedRoute allowedRole="caregiver"><CaregiverTracking /></ProtectedRoute>} />
          <Route path="/caregiver/analysis" element={<ProtectedRoute allowedRole="caregiver"><AIAnalysis /></ProtectedRoute>} />
          <Route path="/caregiver/emotions" element={<ProtectedRoute allowedRole="caregiver"><EmotionDashboard /></ProtectedRoute>} />
          <Route path="/caregiver/chat" element={<ProtectedRoute allowedRole="caregiver"><ChatScreen role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/alerts" element={<ProtectedRoute allowedRole="caregiver"><AlertsScreen role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/profile" element={<ProtectedRoute allowedRole="caregiver"><ProfileScreen role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/settings" element={<ProtectedRoute allowedRole="caregiver"><SettingsScreen role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/edit-profile" element={<ProtectedRoute allowedRole="caregiver"><EditProfile role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/emergency-contacts" element={<ProtectedRoute allowedRole="caregiver"><EmergencyContacts role="caregiver" /></ProtectedRoute>} />
          <Route path="/caregiver/timeline" element={<ProtectedRoute allowedRole="caregiver"><ActivityTimeline role="caregiver" /></ProtectedRoute>} />

          {/* Wearable */}
          <Route path="/wearable/setup" element={<WearableSetup />} />

          {/* Emergency */}
          <Route path="/emergency" element={<EmergencyScreen />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <NotificationToast />
          <BrowserRouter>
            <RealtimeNotificationInit />
            <AnimatedRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
