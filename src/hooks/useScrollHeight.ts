
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
      
      // Use a fixed multiplier that better matches video duration
      // 2.8 multiplier gives more space for the video to complete before transition
      let multiplier = 2.8;
      
      // Device-specific adjustments
      if (isIOS) {
        // iOS needs additional space for reliable scrolling
        multiplier = 3.0;
        console.log(`iOS detected: Using multiplier ${multiplier}`);
      } else if (isAndroid) {
        // Android may need different adjustments
        multiplier = 2.9;
        console.log(`Android detected: Using multiplier ${multiplier}`);
      } else {
        // Desktop or other devices
        console.log(`Desktop/other detected: Using multiplier ${multiplier}`);
      }
      
      const calculatedHeight = Math.round(viewportHeight * multiplier);
      console.log(`Calculated scroll height: ${calculatedHeight}px (viewport: ${viewportHeight}px × ${multiplier})`);
      
      return calculatedHeight;
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
