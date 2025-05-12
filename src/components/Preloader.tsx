
import React, { useState, useEffect } from "react";
import { Progress } from "./ui/progress";

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
        setVisible(false);
        const fadeOutTimeout = setTimeout(() => {
          onComplete();
        }, 500); // Allow time for fade out animation
        return () => clearTimeout(fadeOutTimeout);
      }, 1000); // Wait a moment at 100% before fading
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-darkGreen flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#203435" }}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        <p className="body-text text-coral">{loadingTexts[currentTextIndex]}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="font-gt-super text-title-md-mobile md:text-title-md text-coral">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full max-w-xs md:max-w-sm">
          <Progress 
            value={progress} 
            className="h-2 bg-coral/20" 
            indicatorClassName="bg-coral" 
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
