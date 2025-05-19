
import React, { useState, useEffect } from "react";
import colors from "@/lib/theme";
import { useIsIOS } from "@/hooks/useIsIOS";

interface SimplePreloaderProps {
  progress: number;
  onComplete: () => void;
}

const SimplePreloader: React.FC<SimplePreloaderProps> = ({ progress, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const isIOS = useIsIOS();
  
  // Smoothly update the displayed progress
  useEffect(() => {
    // Only update displayed progress if actual progress is greater
    if (progress > displayedProgress) {
      setDisplayedProgress(progress);
    }
  }, [progress, displayedProgress]);

  // Handle completion - fade out when progress reaches 100%
  useEffect(() => {
    if (displayedProgress >= 100) {
      console.log("Preloader - 100% reached, starting fade out");
      
      // Small delay before starting fade out
      const fadeOutTimeout = setTimeout(() => {
        console.log("Preloader - Fade out animation starting");
        setVisible(false);
        
        // After fade animation completes, call onComplete
        const completeTimeout = setTimeout(() => {
          console.log("Preloader - Calling onComplete");
          onComplete();
        }, 1000); // Fade out animation duration
        
        return () => clearTimeout(completeTimeout);
      }, 500); // Wait 0.5 seconds at 100% before fading
      
      return () => clearTimeout(fadeOutTimeout);
    }
  }, [displayedProgress, onComplete]);

  // Disable scrolling while preloader is active
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible]);

  // Get iOS-specific text styles if needed
  const getTextStyles = () => {
    const baseStyle = { color: colors.coral };
    
    if (isIOS) {
      return {
        ...baseStyle,
        WebkitTextFillColor: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        background: `linear-gradient(90deg, ${colors.coral} 0%, ${colors.coral} 100%)`
      };
    }
    
    return baseStyle;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 bg-darkGreen ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center">
        <span className="title-xl" style={getTextStyles()}>
          {Math.round(displayedProgress)}%
        </span>
      </div>
    </div>
  );
};

export default SimplePreloader;
