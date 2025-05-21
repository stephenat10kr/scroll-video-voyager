
import { useRef } from 'react';
import { FRAMES_BEFORE_END, STANDARD_FRAME_RATE, logDebugInfo } from './scroll-utils';

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
  const lastProgressRef = useRef(0);
  
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
      // Ensure video is loaded
      if (video.readyState === 0) {
        video.load();
        video.currentTime = 0.001;
        return;
      }

      if (isNaN(video.duration) || video.duration <= 0) {
        logDebugInfo("VideoFrame", "Invalid video duration, cannot update frame");
        return;
      }
      
      // Calculate time based on progress
      let targetTime = progress * video.duration;
      
      // Adjust for end frames
      if (progress > 0.95) {
        const stopTime = Math.max(0, video.duration - (FRAMES_BEFORE_END / STANDARD_FRAME_RATE));
        targetTime = Math.min(targetTime, stopTime);
      }
      
      // Set the current time directly
      video.currentTime = targetTime;
      
      // Signal if we're at the end of the video
      onAfterVideoChange(progress > 0.98);
    } catch (err) {
      logDebugInfo("VideoFrame", "Error updating frame:", err);
    }
  };
  
  const cleanup = () => {
    // Nothing to clean up in this simpler implementation
  };

  return {
    updateVideoFrame,
    cleanup
  };
};
