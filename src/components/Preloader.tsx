
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
    // Only update displayed progress if actual progress is greater
    // This prevents progress from going backwards in Safari
    if (progress > displayedProgress) {
      setDisplayedProgress(progress);
    }
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
        
        // Second delay - start fade out
        const fadeOutTimeout = setTimeout(() => {
          console.log("Preloader - Fade out animation starting");
          setVisible(false);
          
          // Third delay - after fade out, call onComplete
          const completeTimeout = setTimeout(() => {
            console.log("Preloader - Calling onComplete");
            onComplete();
          }, 1500); // Longer time for fade out animation (1.5s)
          
          return () => clearTimeout(completeTimeout);
        }, 1000); // Wait 1 second at 100% before fading
        
        return () => clearTimeout(fadeOutTimeout);
      }, 500); // Show "Come in." for 0.5 seconds
      
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-1500 bg-darkGreen ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: colors.darkGreen }}
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
