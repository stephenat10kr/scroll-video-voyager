
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
    logDebugInfo("ScrollContainer", "Device detection - Mobile:", isMobile);
    logDebugInfo("ScrollContainer", "Device detection - iOS:", isIOS);
    logDebugInfo("ScrollContainer", "Device detection - Firefox:", isFirefox);

    // Resize container based on scroll requirements
    const resizeSection = () => {
      if (container) {
        // Simple sizing approach that worked before
        const totalHeight = window.innerHeight + scrollExtraPx;
        container.style.height = `${totalHeight}px`;
        
        // Ensure visibility
        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.display = "block";
        
        logDebugInfo("ScrollContainer", `Container height set to ${totalHeight}px`);
      }
    };
    
    // Initial resize
    resizeSection();
    
    // Listen for window resize events
    window.addEventListener("resize", resizeSection);

    // Clean up
    return () => {
      window.removeEventListener("resize", resizeSection);
    };
  }, [containerRef, scrollExtraPx, isMobile, isIOS, isFirefox]);
};
