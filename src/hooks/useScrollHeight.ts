
import { useState, useEffect } from "react";
import { useIsIOS } from "./useIsIOS";
import { useIsAndroid } from "./use-android";

/**
 * Hook that calculates and returns the appropriate scroll height for video content
 * ensuring consistency across different browsers and devices.
 */
export const useScrollHeight = (): number => {
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  const [scrollHeight, setScrollHeight] = useState<number>(4000); // Default height

  useEffect(() => {
    // Function to calculate the appropriate height based on device and viewport
    const calculateScrollHeight = () => {
      const viewportHeight = window.innerHeight;
      const numberOfSections = 3; // Logo + 2 hero text sections
      
      // Base calculation - multiply viewport height by number of sections
      // and add some extra space for reliable transitions
      let calculatedHeight = viewportHeight * numberOfSections;
      
      // Device-specific adjustments
      if (isIOS) {
        // iOS needs additional space for reliable scrolling
        calculatedHeight = viewportHeight * (numberOfSections + 0.4);
        console.log(`iOS detected: Setting scroll height to ${calculatedHeight}px`);
      } else if (isAndroid) {
        // Android may need different adjustments
        calculatedHeight = viewportHeight * (numberOfSections + 0.2);
        console.log(`Android detected: Setting scroll height to ${calculatedHeight}px`);
      } else {
        // Desktop or other devices
        calculatedHeight = viewportHeight * (numberOfSections + 0.1);
        console.log(`Desktop/other detected: Setting scroll height to ${calculatedHeight}px`);
      }
      
      return Math.round(calculatedHeight);
    };

    // Set initial height
    setScrollHeight(calculateScrollHeight());

    // Update height on window resize
    const handleResize = () => {
      setScrollHeight(calculateScrollHeight());
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isIOS, isAndroid]);

  return scrollHeight;
};
