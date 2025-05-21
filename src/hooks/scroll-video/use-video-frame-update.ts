
import { useRef, useEffect } from 'react';
import { FRAMES_BEFORE_END, STANDARD_FRAME_RATE, logDebugInfo, isVideoDurationValid } from './scroll-utils';

interface UseVideoFrameUpdateParams {
  videoRef: React.RefObject<HTMLVideoElement>;
  onProgressUpdate: (progress: number) => void;
  onAfterVideoChange: (after: boolean) => void;
  isIOS: boolean;
}

/**
 * Hook to manage video frame updates based on scroll position
 */
export const useVideoFrameUpdate = ({
  videoRef,
  onProgressUpdate,
  onAfterVideoChange,
  isIOS
}: UseVideoFrameUpdateParams) => {
  const frameRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  
  // Initialize video if needed
  useEffect(() => {
    // Force video to load first frame if not already loaded
    const video = videoRef.current;
    if (video && video.readyState === 0) {
      video.load();
      video.currentTime = 0.001; // Tiny non-zero value to force frame load
      logDebugInfo("VideoFrame", "Forced initial frame load");
    }
  }, [videoRef]);
  
  // Function to update video frames based on scroll position
  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    // Skip if the progress change is too small (performance optimization)
    if (Math.abs(progress - lastProgressRef.current) < 0.001) return;
    lastProgressRef.current = progress;
    
    // Call the progress change callback
    onProgressUpdate(progress);
    
    try {
      if (video.readyState === 0) {
        // Force load if not ready
        video.load();
        video.currentTime = 0.001;
        return;
      }
      
      // Calculate time based on progress
      let targetTime = progress * video.duration;
      
      // Adjust for end frames
      if (progress > 0.95) {
        const stopTime = Math.max(0, video.duration - (FRAMES_BEFORE_END / STANDARD_FRAME_RATE));
        targetTime = Math.min(targetTime, stopTime);
      }
      
      // Use direct time setting for immediate response
      if (video.currentTime !== targetTime) {
        video.currentTime = targetTime;
        logDebugInfo("VideoFrame", `Set time: ${targetTime.toFixed(2)}s (${(progress * 100).toFixed(1)}%)`);
      }
      
      // Signal if we're at the end of the video
      onAfterVideoChange(progress > 0.98);
    } catch (err) {
      logDebugInfo("VideoFrame", "Error updating frame:", err);
    }
  };
  
  // Clean up function to cancel animation frame
  const cleanup = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  return {
    updateVideoFrame,
    cleanup
  };
};
