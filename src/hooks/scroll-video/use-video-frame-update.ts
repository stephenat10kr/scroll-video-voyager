
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
  const progressThreshold = 0.0001; // More sensitive threshold for detecting changes
  
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
    if (!isVideoDurationValid(video)) {
      logDebugInfo("VideoFrame", "Video not ready for frame update", { readyState: video?.readyState, duration: video?.duration });
      return;
    }

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
      const maxTime = video!.duration - stopTimeBeforeEnd;
      adjustedProgress = Math.min(progress, maxTime / video!.duration);
      
      // For iOS, add specialized handling
      if (isIOS && progress > 0.98) {
        // Let iOS go a bit closer to the end (but not all the way)
        adjustedProgress = Math.min(0.99, progress);
        logDebugInfo("VideoFrame", `iOS near end: progress=${progress.toFixed(4)}, adjusted=${adjustedProgress.toFixed(4)}`);
      }
    }
    
    // Calculate the new video time based on adjusted progress
    const newTime = adjustedProgress * video!.duration;
    
    // Cancel any existing animation frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    // Use requestAnimationFrame for smoother updates
    frameRef.current = requestAnimationFrame(() => {
      if (video) {
        // Ensure currentTime is forced to update
        if (Math.abs(video.currentTime - newTime) > 0.01) {
          video.currentTime = newTime;
          logDebugInfo("VideoFrame", `Updated to time: ${newTime.toFixed(2)}s (${(adjustedProgress * 100).toFixed(1)}%)`);
        }
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
