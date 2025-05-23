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
  const [showWelcome, setShowWelcome] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
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

  // Handle completion - show "Come in" when progress reaches 100%
  useEffect(() => {
    if (displayedProgress >= 100) {
      console.log("Preloader - 100% reached, showing welcome message");
      
      // Show "Come in." text
      setShowWelcome(true);
      
      // Call onComplete right away, but don't hide the preloader
      // This will trigger the video to start fading in
      console.log("Preloader - Calling onComplete");
      onComplete();
      
      // Start fade out animation after a short delay (700ms)
      setTimeout(() => {
        console.log("Preloader - Starting fade out animation");
        setFadeOut(true);
      }, 700);
    }
  }, [displayedProgress, onComplete]);

  // Disable scrolling while loading
  useEffect(() => {
    if (displayedProgress < 100) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [displayedProgress]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-darkGreen"
      style={{ 
        backgroundColor: colors.darkGreen, 
        zIndex: 40, // Updated from 25 to 40 to be above all content but below navigation (z-50)
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease-out",
        pointerEvents: fadeOut ? 'none' : 'auto',
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
