
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
      const timeout = setTimeout(() => {
        const fadeOutTimeout = setTimeout(() => {
          setVisible(false);
          const completeTimeout = setTimeout(() => {
            onComplete();
          }, 500); // Allow time for fade out animation
          return () => clearTimeout(completeTimeout);
        }, 500); 
        return () => clearTimeout(fadeOutTimeout);
      }, 1000); // Wait a moment at 100% before fading
      return () => clearTimeout(timeout);
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 bg-[#203435] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Loading percentage and text */}
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          <span 
            className="font-gt-super text-coral" 
            style={{ fontSize: "32px" }}
          >
            {Math.round(progress)}%
          </span>
          <p className="text-coral text-lg">{loadingTexts[currentTextIndex]}</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
