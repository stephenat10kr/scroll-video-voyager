
/**
 * Shared constants and utilities for scroll video functionality
 */

// Constants for video playback
export const STANDARD_FRAME_RATE = 30;
export const FRAMES_BEFORE_END = 2; // Keep at 2 frames for better iOS experience

// Simple scrub values that worked reliably in the past
export const getScrubValue = (isFirefox: boolean, isMobile: boolean, isIOS: boolean): number => {
  if (isIOS) return 0.1;  
  if (isFirefox) return 0.2;
  if (isMobile) return 0.15;
  return 0.1; // Default value for desktop
};

// Helper to log specific debug information
export const logDebugInfo = (context: string, message: string, data?: any): void => {
  console.log(`[${context}] ${message}`, data || '');
};

// Added utility to ensure video has valid duration
export const isVideoDurationValid = (video: HTMLVideoElement | null): boolean => {
  if (!video) return false;
  return !isNaN(video.duration) && video.duration > 0 && video.readyState > 0;
};
