
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
  const [showWelcome, setShowWelcome] = useState(false);
  
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
      
      // Show "Come in." text briefly before fading out
      setShowWelcome(true);
      
      // First delay - stay at 100% "Come in." state for 0.5 seconds (changed from 1.5s)
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
      }, 500); // Show "Come in." for 0.5 seconds (changed from 1.5s)
      
      return () => clearTimeout(welcomeTimeout);
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
          {showWelcome && progress >= 100 ? (
            <span className="title-lg text-coral">Come in.</span>
          ) : (
            <span className="title-lg text-coral">
              {Math.round(progress)}%
            </span>
          )}
          {!showWelcome && (
            <p className="text-coral text-lg">{loadingTexts[currentTextIndex]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preloader;
