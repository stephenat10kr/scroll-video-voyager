
import React, { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoAttemptsRef = useRef(0);
  const maxVideoAttempts = 3;
  
  // Function to calculate actual video loading progress
  const calculateVideoProgress = (video: HTMLVideoElement): number => {
    // If no duration is available, we can't calculate progress
    if (!video || !isFinite(video.duration) || video.duration === 0) {
      return 0;
    }
    
    // Check buffered ranges
    if (video.buffered.length > 0) {
      // Get the end time of the last buffered range
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      // Calculate progress as percentage of duration
      const progress = (bufferedEnd / video.duration) * 100;
      return Math.min(Math.round(progress), 98); // Cap at 98% to leave room for final ready state
    }
    
    return 0;
  };

  // Set up video loading detection
  useEffect(() => {
    // If we don't have a video source yet, don't attempt to track loading
    if (!videoSrc) return;
    
    // Create a temporary video element to track loading
    const tempVideo = document.createElement('video');
    videoRef.current = tempVideo;
    
    // Set up event listeners for accurate loading progress
    const onProgress = () => {
      const progress = calculateVideoProgress(tempVideo);
      if (progress > loadProgress) {
        setLoadProgress(progress);
      }
    };
    
    const onCanPlayThrough = () => {
      console.log('Video can play through!');
      // Video is fully loaded or has enough data to play through
      setLoadProgress(100);
      
      // After a short delay, hide the preloader
      if (showPreloader) {
        setTimeout(() => {
          setShowPreloader(false);
        }, 500); // Short delay to ensure smooth transition
      }
    };
    
    const onLoadedMetadata = () => {
      console.log('Video metadata loaded!');
      // Metadata has loaded, we have duration information
      // Update progress to at least 15%
      setLoadProgress(prev => Math.max(prev, 15));
    };
    
    const onLoadedData = () => {
      console.log('Video data loaded!');
      // First frame is loaded
      // Update progress to at least 30%
      setLoadProgress(prev => Math.max(prev, 30));
    };
    
    const onError = (e: ErrorEvent) => {
      console.error('Video loading error:', e);
      videoAttemptsRef.current += 1;
      
      if (videoAttemptsRef.current < maxVideoAttempts) {
        console.log(`Retry attempt ${videoAttemptsRef.current}/${maxVideoAttempts}`);
        // Try loading again after a short delay
        setTimeout(() => {
          if (tempVideo) {
            tempVideo.load();
          }
        }, 1000);
      } else {
        // After max attempts, force progress to complete to avoid getting stuck
        console.log('Max retry attempts reached, forcing progress complete');
        setLoadProgress(100);
      }
    };
    
    // Add all event listeners
    tempVideo.addEventListener('progress', onProgress);
    tempVideo.addEventListener('canplaythrough', onCanPlayThrough);
    tempVideo.addEventListener('loadedmetadata', onLoadedMetadata);
    tempVideo.addEventListener('loadeddata', onLoadedData);
    tempVideo.addEventListener('error', onError);
    
    // Set source and start loading
    tempVideo.src = videoSrc;
    tempVideo.load();
    
    // Fallback timer - ensure we don't get stuck if events don't fire properly
    const totalLoadTime = 15000; // 15 seconds maximum loading time
    let startProgress = loadProgress;
    
    loadingTimerRef.current = setInterval(() => {
      // Check if the video has made progress on its own
      const actualProgress = calculateVideoProgress(tempVideo);
      
      // If actual progress is advancing, prefer that over the timer
      if (actualProgress > loadProgress) {
        setLoadProgress(actualProgress);
      } 
      // Otherwise, slowly increment as a fallback
      else if (loadProgress < 90) {
        // Calculate time-based progress as a fallback
        // This adds about 10% every 3 seconds as a fallback
        const elapsed = Date.now() - startTime;
        const timerProgress = Math.min(
          90, // Cap at 90%
          startProgress + (elapsed / totalLoadTime) * 80 // Allow up to 80% from timer
        );
        
        setLoadProgress(Math.max(loadProgress, Math.round(timerProgress)));
      }
      
      // If we're at 100% or close to the max time, clear the timer
      if (loadProgress >= 100 || tempVideo.readyState >= 4) {
        if (loadingTimerRef.current) {
          clearInterval(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
      }
    }, 500);
    
    const startTime = Date.now();
    
    // Final fallback - force completion after max time
    const finalFallbackTimer = setTimeout(() => {
      console.log('Final fallback timer triggered - forcing completion');
      setLoadProgress(100);
      
      // Ensure preloader is dismissed after max time
      setTimeout(() => {
        setShowPreloader(false);
      }, 500);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }, totalLoadTime + 2000); // Max time plus buffer
    
    // Cleanup function
    return () => {
      tempVideo.removeEventListener('progress', onProgress);
      tempVideo.removeEventListener('canplaythrough', onCanPlayThrough);
      tempVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
      tempVideo.removeEventListener('loadeddata', onLoadedData);
      tempVideo.removeEventListener('error', onError);
      
      // Clean up timers
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      
      clearTimeout(finalFallbackTimer);
      
      // Clean up video reference
      tempVideo.src = '';
      tempVideo.load();
      videoRef.current = null;
    };
  }, [videoSrc, loadProgress, showPreloader]);
  
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
    setShowPreloader(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Log for debugging
  console.log('Video component - videoSrc:', videoSrc);
  console.log('Video component - asset data:', videoAsset);
  console.log('Video component - loading:', isLoading);
  console.log('Video component - error:', error);
  console.log('Video component - progress:', loadProgress);

  return (
    <div className="relative">
      <ScrollVideo src={videoSrc} />
      {showPreloader && (
        <Preloader 
          progress={loadProgress} 
          onComplete={handlePreloaderComplete} 
        />
      )}
    </div>
  );
};

export default Video;
