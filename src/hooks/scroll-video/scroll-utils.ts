
/**
 * Shared constants and utilities for scroll video functionality
 */

// Constants for video playback
export const STANDARD_FRAME_RATE = 30;
export const FRAMES_BEFORE_END = 2; // Keep at 2 frames for better iOS experience

// Return device-specific scrub value for smoother scrolling
export const getScrubValue = (isFirefox: boolean, isMobile: boolean, isIOS: boolean): number => {
  // More aggressive scrub values to ensure responsiveness
  if (isIOS) {
    return 0.1; // More responsive on iOS
  }
  
  // Return based on browser/device - lower values = more responsive
  return isFirefox ? 0.2 : (isMobile ? 0.1 : 0.05);
};

// Helper to log specific debug information
export const logDebugInfo = (context: string, message: string, data?: any): void => {
  console.log(`[${context}] ${message}`, data || '');
};

// Added utility to ensure video has valid duration
export const isVideoDurationValid = (video: HTMLVideoElement | null): boolean => {
  return !!video && !isNaN(video.duration) && video.duration > 0;
};
