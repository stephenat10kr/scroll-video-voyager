
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
    return 1.5; // Reduced from 2.2 to 1.5 for better scroll control on iOS
  }
  
  // Different values for different browsers/devices
  return isFirefox ? 1.8 : (isMobile ? 1.0 : 0.5); // Adjusted scrub values for smoother scrolling
};

// Helper to log specific debug information
export const logDebugInfo = (context: string, message: string, data?: any): void => {
  console.log(`[${context}] ${message}`, data || '');
};
