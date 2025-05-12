
import React, { useState, useEffect } from "react";
import ScrollVideo from "./ScrollVideo";
import { useContentfulAsset } from "../hooks/useContentfulAsset";
import Preloader from "./Preloader";

const Video = () => {
  // Use the specific Contentful asset ID for the scrub-optimized video
  const { data: videoAsset, isLoading, error } = useContentfulAsset("1A0xTn5l44SvzrObLYLQmG");
  
  // Use undefined as fallback instead of local video reference
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  const [loadProgress, setLoadProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  
  // Simulate loading progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeElapsed = 0;
    const totalLoadTime = 12000; // 12 seconds total loading time
    
    // If video is actually loading, start from 0
    // If video is already loaded or there's an error, start from a higher value
    const startingProgress = isLoading ? 0 : 60;
    setLoadProgress(startingProgress);
    
    if (showPreloader) {
      progressInterval = setInterval(() => {
        timeElapsed += 100;
        
        // Calculate progress percentage
        const baseProgress = Math.min(
          (timeElapsed / totalLoadTime) * 100, 
          videoSrc ? 98 : 90 // Cap at 98% if we have a video source, otherwise 90%
        );
        
        // If video is loaded, allow progress to reach 100
        const finalProgress = !isLoading && videoSrc ? 
          Math.min(baseProgress + 2, 100) : // Push to 100% if video is loaded
          baseProgress; // Otherwise stick to base progress
          
        setLoadProgress(Math.min(startingProgress + finalProgress, 100));
        
        // If we've reached 100% or time is up, clear the interval
        if (finalProgress >= 100 || timeElapsed >= totalLoadTime) {
          clearInterval(progressInterval);
          
          // Force to 100% after max time
          if (timeElapsed >= totalLoadTime) {
            setLoadProgress(100);
          }
        }
      }, 100);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, showPreloader, videoSrc]);
  
  // Log for debugging
  console.log('Video component - videoSrc:', videoSrc);
  console.log('Video component - asset data:', videoAsset);
  console.log('Video component - loading:', isLoading);
  console.log('Video component - error:', error);
  console.log('Video component - progress:', loadProgress);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Disable scrolling while preloader is active
  useEffect(() => {
    if (showPreloader) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPreloader]);

  return (
    <>
      {showPreloader && (
        <Preloader 
          progress={loadProgress} 
          onComplete={handlePreloaderComplete} 
        />
      )}
      <ScrollVideo src={videoSrc} />
    </>
  );
};

export default Video;
