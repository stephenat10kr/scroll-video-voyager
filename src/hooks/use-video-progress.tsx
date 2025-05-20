
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to handle video scroll progress tracking and transition effects
 */
export const useVideoProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const lastProgressRef = useRef(0);
  
  // Update video styling based on scroll direction
  useEffect(() => {
    // Returned for use in components
    return { progress, lastProgress: lastProgressRef.current, isAfterVideo };
  }, [progress, isAfterVideo]);

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleAfterVideoChange = (afterVideo: boolean) => {
    setIsAfterVideo(afterVideo);
  };

  return {
    progress,
    isAfterVideo,
    lastProgress: lastProgressRef.current,
    handleProgressChange,
    handleAfterVideoChange,
    setLastProgress: (value: number) => {
      lastProgressRef.current = value;
    }
  };
};
