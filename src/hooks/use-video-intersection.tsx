
import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to detect when a video element enters or exits the viewport
 */
export const useVideoIntersection = (
  containerRef: RefObject<HTMLDivElement>,
  options?: IntersectionObserverInit
) => {
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Default options with multiple thresholds for smoother transitions
    const defaultOptions = { 
      threshold: [0, 0.1, 0.5, 0.9],
      rootMargin: "20px" 
    };

    // Merge default options with any passed options
    const mergedOptions = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        console.log(`Video visibility changed: ${entry.isIntersecting ? 'visible' : 'hidden'}, intersection ratio: ${entry.intersectionRatio}`);
      },
      mergedOptions
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, options]);

  return isInViewport;
};
