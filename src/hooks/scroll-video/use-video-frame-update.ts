
import { useRef } from 'react';
import { FRAMES_BEFORE_END, STANDARD_FRAME_RATE } from './scroll-utils';

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
  const progressThreshold = 0.002;
  
  // Function to update video frames based on scroll position
  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // Skip updating if the progress change is too small
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    
    // Call the progress change callback
    onProgressUpdate(progress);
    
    // iOS specific handling with extensive logging
    if (isIOS) {
      console.log(`iOS video progress: ${progress.toFixed(4)}, duration: ${video.duration.toFixed(2)}`);
    }
    
    // Calculate time to stop before the end of the video
    // For iOS, use a smaller value to ensure we get closer to the end of the video
    const framesBeforeEnd = isIOS ? 1 : FRAMES_BEFORE_END;
    const stopTimeBeforeEnd = framesBeforeEnd / STANDARD_FRAME_RATE;
    
    // Adjust progress to stop frames before the end
    let adjustedProgress = progress;
    if (progress > 0.95) {  // Start adjusting earlier at 95% instead of 97%
      // Scale progress to end at (duration - stopTimeBeforeEnd)
      const maxTime = video.duration - stopTimeBeforeEnd;
      adjustedProgress = Math.min(progress, maxTime / video.duration);
      
      // For iOS, let the progress go very near the end (special handling)
      if (isIOS && progress > 0.99) {
        // Let iOS go much closer to the end
        adjustedProgress = Math.min(1, progress);
      }
      
      // Additional logging for end of video behavior
      if (isIOS || progress > 0.98) {
        console.log(`Near end: progress=${progress.toFixed(4)}, adjusted=${adjustedProgress.toFixed(4)}, time=${(adjustedProgress * video.duration).toFixed(2)}/${video.duration.toFixed(2)}`);
      }
    }
    
    const newTime = adjustedProgress * video.duration;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      video.currentTime = newTime;
      onAfterVideoChange(progress >= 0.99); // Consider "after video" slightly earlier
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
