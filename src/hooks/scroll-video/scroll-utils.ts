
/**
 * Shared constants and utilities for scroll video functionality
 */

// Constants for video playback
export const STANDARD_FRAME_RATE = 30;
export const FRAMES_BEFORE_END = 2; // Reduced from 5 to 2 frames for better iOS experience

// Return device-specific scrub value for smoother scrolling
export const getScrubValue = (isFirefox: boolean, isMobile: boolean, isIOS: boolean): number => {
  // Special case for iOS to make scrolling smoother
  if (isIOS) {
    return 2.2; // Smoother scrolling for iOS with increased value from 1.5 to 2.2
  }
  
  // Different values for different browsers/devices
  return isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8);
};

// Helper to log specific debug information
export const logDebugInfo = (context: string, message: string, data?: any): void => {
  console.log(`[${context}] ${message}`, data || '');
};
