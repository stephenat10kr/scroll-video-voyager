
import { useRef } from "react";

export const useAndroidVideoSmoothing = () => {
  const targetTimeRef = useRef<number>(0);
  const interpolationFrameRef = useRef<number | null>(null);
  const isInterpolatingRef = useRef<boolean>(false);
  const interpolationSpeed = 0.15;

  const smoothlyUpdateVideoTime = (video: HTMLVideoElement, targetTime: number) => {
    targetTimeRef.current = targetTime;
    
    if (isInterpolatingRef.current) return;
    
    isInterpolatingRef.current = true;
    
    const interpolateTime = () => {
      if (!video) {
        isInterpolatingRef.current = false;
        return;
      }
      
      const currentTime = video.currentTime;
      const timeDiff = targetTimeRef.current - currentTime;
      
      if (Math.abs(timeDiff) < 0.01) {
        video.currentTime = targetTimeRef.current;
        isInterpolatingRef.current = false;
        return;
      }
      
      const newTime = currentTime + (timeDiff * interpolationSpeed);
      video.currentTime = newTime;
      
      interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
    };
    
    if (interpolationFrameRef.current) {
      cancelAnimationFrame(interpolationFrameRef.current);
    }
    interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
  };

  const cleanup = () => {
    if (interpolationFrameRef.current) {
      cancelAnimationFrame(interpolationFrameRef.current);
    }
    isInterpolatingRef.current = false;
  };

  return { smoothlyUpdateVideoTime, cleanup };
};
