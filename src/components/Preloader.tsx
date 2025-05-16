
import React, { useState, useEffect } from "react";

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
  const [showReady, setShowReady] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log(`Preloader - Current progress: ${progress}%`);
  }, [progress]);

  // Change text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle completion - fade out when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      console.log("Preloader - 100% reached, preparing to fade out");
      
      // Show "Ready" text briefly before fading out
      setShowReady(true);
      
      // First delay - stay at 100% "Ready" state for 1.5 seconds
      const readyTimeout = setTimeout(() => {
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
      }, 1500); // Show "Ready" for 1.5 seconds
      
      return () => clearTimeout(readyTimeout);
    }
  }, [progress, onComplete]);

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-1500 bg-[#203435] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Loading percentage and text */}
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          {showReady && progress >= 100 ? (
            <span className="title-xl text-coral animate-pulse">Ready</span>
          ) : (
            <span className="title-xl text-coral">
              {Math.round(progress)}%
            </span>
          )}
          {!showReady && (
            <p className="text-coral text-lg">{loadingTexts[currentTextIndex]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preloader;
