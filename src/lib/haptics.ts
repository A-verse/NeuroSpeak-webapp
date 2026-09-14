/**
 * Haptic feedback utility using Vibration API
 */
export const haptics = {
  light: () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
  },
  medium: () => {
    if ("vibrate" in navigator) navigator.vibrate(25);
  },
  heavy: () => {
    if ("vibrate" in navigator) navigator.vibrate(50);
  },
  emergency: () => {
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
  },
  success: () => {
    if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);
  },
  notification: () => {
    if ("vibrate" in navigator) navigator.vibrate([15, 20, 15]);
  },
};
