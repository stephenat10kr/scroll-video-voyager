
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
  const frameRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.001; // Reduced threshold for more responsive updates
  
  // Function to update video frames based on scroll position
  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // Skip updating if the progress change is too small (improves performance)
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    
    // Call the progress change callback
    onProgressUpdate(progress);
    
    // Calculate time to stop before the end of the video
    const framesBeforeEnd = FRAMES_BEFORE_END;
    const stopTimeBeforeEnd = framesBeforeEnd / STANDARD_FRAME_RATE;
    
    // Adjust progress to stop frames before the end
    let adjustedProgress = progress;
    
    // If near the end of the video, adjust progress to prevent hitting the actual end frame
    if (progress > 0.95) {
      const maxTime = video.duration - stopTimeBeforeEnd;
      adjustedProgress = Math.min(progress, maxTime / video.duration);
      
      // For iOS, add specialized handling
      if (isIOS && progress > 0.98) {
        // Let iOS go a bit closer to the end (but not all the way)
        adjustedProgress = Math.min(0.99, progress);
        logDebugInfo("VideoFrame", `iOS near end: progress=${progress.toFixed(4)}, adjusted=${adjustedProgress.toFixed(4)}`);
      }
    }
    
    // Calculate the new video time based on adjusted progress
    const newTime = adjustedProgress * video.duration;
    
    // Cancel any existing animation frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    // Use requestAnimationFrame for smoother updates
    frameRef.current = requestAnimationFrame(() => {
      if (video) {
        video.currentTime = newTime;
      }
      // Consider "after video" when progress is very close to the end
      onAfterVideoChange(progress >= 0.98);
    });
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
