
import React, { useState, useEffect, useRef } from "react";
import Preloader from "./Preloader";

interface SitePreloaderProps {
  children: React.ReactNode;
}

const SitePreloader: React.FC<SitePreloaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const loadStartTimeRef = useRef<number>(Date.now());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Minimum loading time in milliseconds (3 seconds)
  const MIN_LOADING_TIME = 3000;
  // Maximum loading time before forcing completion
  const MAX_LOADING_TIME = 15000;

  // Update progress based on time elapsed
  useEffect(() => {
    // Start progress timer that gradually increases progress over time
    progressIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - loadStartTimeRef.current;
      
      // Calculate progress as a percentage of MIN_LOADING_TIME
      let timeBasedProgress = Math.min(100, (elapsedTime / MIN_LOADING_TIME) * 100);
      
      setLoadProgress((prevProgress) => {
        // Ensure progress never decreases and increases smoothly
        const newProgress = Math.max(prevProgress, timeBasedProgress);
        
        // Force completion after MAX_LOADING_TIME
        if (elapsedTime > MAX_LOADING_TIME) {
          return 100;
        }
        
        return newProgress;
      });
      
      // Clear interval once we reach 100%
      if (loadProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 100); // Update every 100ms for smooth progress
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [loadProgress]);
  
  // Check if all assets are loaded
  useEffect(() => {
    window.addEventListener('load', () => {
      setIsLoaded(true);
      
      // Ensure we've met the minimum loading time
      const elapsedTime = Date.now() - loadStartTimeRef.current;
      if (elapsedTime >= MIN_LOADING_TIME) {
        setLoadProgress(100);
      }
    });
    
    // Force completion after MAX_LOADING_TIME regardless of actual loading
    const forceCompleteTimeout = setTimeout(() => {
      setLoadProgress(100);
      setIsLoaded(true);
    }, MAX_LOADING_TIME);
    
    return () => {
      clearTimeout(forceCompleteTimeout);
    };
  }, []);
  
  // Disable scrolling while preloader is active
  useEffect(() => {
    if (showPreloader) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPreloader]);

  const handlePreloaderComplete = () => {
    console.log('SitePreloader - Complete handler called');
    setShowPreloader(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  return (
    <>
      {showPreloader && (
        <Preloader 
          progress={loadProgress} 
          onComplete={handlePreloaderComplete} 
        />
      )}
      {children}
    </>
  );
};

export default SitePreloader;
