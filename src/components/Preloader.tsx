
import React, { useState, useEffect } from "react";
import colors from "@/lib/theme";

interface PreloaderProps {
  progress: number;
  onComplete: () => void;
}

const loadingTexts = [
  "Curating your experience.",
  "Gathering sounds.",
  "Bottling lightning.",
  "Loading possibilities."
];

const Preloader: React.FC<PreloaderProps> = ({ progress, onComplete }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  // For debugging
  useEffect(() => {
    console.log(`Preloader - Current progress: ${progress}%`);
  }, [progress]);
  
  // Smoothly update the displayed progress to avoid jumps
  useEffect(() => {
    // If actual progress is 100%, immediately update displayed progress to 100%
    if (progress >= 100) {
      console.log("Preloader - Received 100% progress, updating immediately");
      setDisplayedProgress(100);
      return;
    }
    
    // Otherwise only update if progress is greater
    // This prevents progress from going backwards
    if (progress > displayedProgress) {
      setDisplayedProgress(progress);
    }
    
    // Force complete after a maximum time
    const forceCompleteTimer = setTimeout(() => {
      if (displayedProgress >= 95 && displayedProgress < 100) {
        console.log("Preloader - Force completing from 95% to 100%");
        setDisplayedProgress(100);
      }
    }, 1500); // Reduced from 3000ms to 1500ms - if stuck at 95% for 1.5 seconds, force to 100%
    
    return () => clearTimeout(forceCompleteTimer);
  }, [progress, displayedProgress]);

  // Change text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle completion - fade out when progress reaches 100%
  useEffect(() => {
    if (displayedProgress >= 100) {
      console.log("Preloader - 100% reached, preparing to fade out");
      
      // Show "Come in." text briefly before fading out
      setShowWelcome(true);
      
      // First delay - stay at 100% "Come in." state for 0.5 seconds
      const welcomeTimeout = setTimeout(() => {
        console.log("Preloader - Starting fade out sequence");
        
        // Start fade out sooner
        setVisible(false);
        
        // Call onComplete after fade out animation completes
        const completeTimeout = setTimeout(() => {
          console.log("Preloader - Calling onComplete");
          onComplete();
        }, 750); // Reduced from 800ms to 750ms for slightly faster transition
        
        return () => clearTimeout(completeTimeout);
      }, 500); // Keep 500ms for "Come in." message
      
      return () => clearTimeout(welcomeTimeout);
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

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-800 bg-darkGreen ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ 
        backgroundColor: colors.darkGreen, 
        transition: "opacity 0.75s ease-out",  // Faster transition
        pointerEvents: visible ? "auto" : "none" // Prevent interaction when invisible
      }}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Loading percentage and text */}
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          {showWelcome && displayedProgress >= 100 ? (
            <span className="title-xl text-coral" style={{ color: colors.coral }}>Come in.</span>
          ) : (
            <span className="title-xl text-coral" style={{ color: colors.coral }}>
              {Math.round(displayedProgress)}%
            </span>
          )}
          {!showWelcome && (
            <p className="text-coral text-lg" style={{ color: colors.coral }}>{loadingTexts[currentTextIndex]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preloader;
