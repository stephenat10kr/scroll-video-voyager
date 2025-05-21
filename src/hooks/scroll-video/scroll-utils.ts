
/**
 * Shared constants and utilities for scroll video functionality
 */

// Constants for video playback
export const STANDARD_FRAME_RATE = 30;
export const FRAMES_BEFORE_END = 2; // Keep at 2 frames for better iOS experience

// Return device-specific scrub value for smoother scrolling
export const getScrubValue = (isFirefox: boolean, isMobile: boolean, isIOS: boolean): number => {
  // Special case for iOS to make scrolling smoother
  if (isIOS) {
    return 0.5; // Reduced value for more responsive scrubbing on iOS
  }
  
  // Different values for different browsers/devices
  return isFirefox ? 0.8 : (isMobile ? 0.5 : 0.2); // Lower values for more responsive scrubbing
};

// Helper to log specific debug information
export const logDebugInfo = (context: string, message: string, data?: any): void => {
  console.log(`[${context}] ${message}`, data || '');
};

// Added utility to ensure video has valid duration
export const isVideoDurationValid = (video: HTMLVideoElement | null): boolean => {
  return !!video && !isNaN(video.duration) && video.duration > 0 && video.readyState >= 2;
};
