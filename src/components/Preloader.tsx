
import React, { useState, useEffect } from "react";
import colors from "@/lib/theme";

interface PreloaderProps {
  progress: number;
  onComplete: () => void;
  videoReady?: boolean; // Add optional prop to know when video is ready
}

const loadingTexts = [
  "Curating your experience.",
  "Gathering sounds.",
  "Bottling lightning.",
  "Loading possibilities."
];

const Preloader: React.FC<PreloaderProps> = ({ progress, onComplete, videoReady = false }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [fadeOutStarted, setFadeOutStarted] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log(`Preloader - Current progress: ${progress}%, Video ready: ${videoReady}`);
  }, [progress, videoReady]);
  
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

  // Handle completion - only start the fade out when progress reaches 100% AND video is ready
  useEffect(() => {
    // Start fade out process only when progress is 100% and video is ready (if videoReady prop is provided)
    const shouldStartFadeOut = displayedProgress >= 100 && (videoReady || typeof videoReady === 'undefined');
    
    if (shouldStartFadeOut && !fadeOutStarted) {
      console.log("Preloader - 100% reached and video ready, preparing to fade out");
      setFadeOutStarted(true);
      
      // Show "Come in." text briefly before fading out
      setShowWelcome(true);
      
      // First delay - stay at 100% "Come in." state for 1 second (increased from 0.5)
      const welcomeTimeout = setTimeout(() => {
        console.log("Preloader - Starting fade out sequence");
        
        // Add a small additional delay before starting fade out
        const fadeOutTimeout = setTimeout(() => {
          // Start fade out with a longer transition
          setVisible(false);
          
          // Call onComplete after fade out animation completes
          const completeTimeout = setTimeout(() => {
            console.log("Preloader - Calling onComplete");
            onComplete();
          }, 1000); // Increased from 750ms to 1000ms for slightly smoother transition
          
          return () => clearTimeout(completeTimeout);
        }, 500); // Added 500ms additional delay before fade starts
        
        return () => clearTimeout(fadeOutTimeout);
      }, 1000); // Increased from 500ms to 1000ms for "Come in." message
      
      return () => clearTimeout(welcomeTimeout);
    }
  }, [displayedProgress, onComplete, videoReady, fadeOutStarted]);

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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity bg-darkGreen ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ 
        backgroundColor: colors.darkGreen, 
        transition: "opacity 1s ease-out",  // Longer, smoother transition
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
