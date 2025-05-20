
import { useEffect } from "react";
import { logDebugInfo } from "./scroll-utils";

interface UseScrollContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollExtraPx: number;
  isMobile: boolean;
  isIOS: boolean;
  isFirefox: boolean;
}

/**
 * Hook to set up container sizing and log device information
 */
export const useScrollContainer = ({
  containerRef,
  scrollExtraPx,
  isMobile,
  isIOS,
  isFirefox
}: UseScrollContainerProps) => {
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Log device detection info
    logDebugInfo("ScrollContainer", "Mobile detection:", isMobile);
    logDebugInfo("ScrollContainer", "iOS detection:", isIOS);
    logDebugInfo("ScrollContainer", "Firefox detection:", isFirefox);
    logDebugInfo("ScrollContainer", "Scroll extra pixels:", scrollExtraPx);

    // Resize container based on scroll requirements
    const resizeSection = () => {
      if (container) {
        // Calculate total height including extra scroll distance
        const totalHeight = window.innerHeight + scrollExtraPx;
        logDebugInfo("ScrollContainer", `Setting container height to ${totalHeight}px`);
        container.style.height = `${totalHeight}px`;
      }
    };
    
    // Initial resize
    resizeSection();
    
    // Listen for window resize events
    window.addEventListener("resize", resizeSection);

    // Clean up function
    return () => {
      window.removeEventListener("resize", resizeSection);
    };
  }, [containerRef, scrollExtraPx, isMobile, isIOS, isFirefox]);
};
