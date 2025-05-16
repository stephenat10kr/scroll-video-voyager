
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
  
  // Track when loading started
  const loadStartTimeRef = useRef<number>(Date.now());
  // Minimum loading time in milliseconds (6 seconds)
  const MIN_LOADING_TIME = 6000;
  // Maximum loading time before forcing completion
  const MAX_LOADING_TIME = 15000;
  
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
      return Math.min(Math.round(progress), 95); // Cap at 95% to leave room for final loading steps
    }
    
    return 0;
  };
  
  // New function to ensure smooth progress that doesn't complete too quickly
  const updateProgressWithConstraints = (actualProgress: number) => {
    // Calculate elapsed time since loading started
    const elapsedTime = Date.now() - loadStartTimeRef.current;
    
    // Calculate time-based progress (0-100% over MIN_LOADING_TIME)
    const timeBasedProgress = Math.min(100, (elapsedTime / MIN_LOADING_TIME) * 100);
    
    // FIXED: Ensure we have a minimum visible progress that increases over time
    // This ensures we don't get stuck at low percentages
    const minProgressByTime = Math.max(5, timeBasedProgress * 0.5);
    
    // During minimum loading period, use the maximum between:
    // 1. The time-based minimum (ensuring we always progress)
    // 2. The actual progress (but limited by time-based maximum)
    let newProgress;
    if (elapsedTime < MIN_LOADING_TIME) {
      // Take the higher value of minProgressByTime and limited actual progress
      const limitedActualProgress = Math.min(actualProgress, timeBasedProgress);
      newProgress = Math.max(minProgressByTime, limitedActualProgress);
      console.log(`Video - Time-constrained progress: ${newProgress.toFixed(1)}% (actual: ${actualProgress.toFixed(1)}%, time-based min: ${minProgressByTime.toFixed(1)}%, time-based max: ${timeBasedProgress.toFixed(1)}%)`);
    } else {
      // After minimum time, accelerate to completion
      newProgress = Math.max(actualProgress, timeBasedProgress);
      console.log(`Video - Post-min time progress: ${newProgress.toFixed(1)}%`);
      
      // If we've exceeded minimum time and progress is high enough, move to completion
      if (elapsedTime > MIN_LOADING_TIME * 1.25 && newProgress > 75) {
        newProgress = 100;
        console.log('Video - Minimum time exceeded with good progress, completing');
      }
    }
    
    setLoadProgress(newProgress);
    
    // Force completion after maximum time
    if (elapsedTime > MAX_LOADING_TIME && loadProgress < 100) {
      console.log('Video - Maximum loading time reached, completing');
      setLoadProgress(100);
    }
  };

  // Set up video loading detection
  useEffect(() => {
    // If we don't have a video source yet, don't attempt to track loading
    if (!videoSrc) return;
    
    console.log('Video - Starting loading sequence');
    // Reset the loading start time when the component mounts or source changes
    loadStartTimeRef.current = Date.now();
    
    // Create a temporary video element to track loading
    const tempVideo = document.createElement('video');
    videoRef.current = tempVideo;
    
    // Set up event listeners for accurate loading progress
    const onProgress = () => {
      const progress = calculateVideoProgress(tempVideo);
      updateProgressWithConstraints(progress);
    };
    
    const onCanPlayThrough = () => {
      console.log('Video can play through!');
      // Video is fully loaded or has enough data to play through
      // But we don't immediately set to 100% - we respect the minimum time constraint
      updateProgressWithConstraints(100);
    };
    
    const onLoadedMetadata = () => {
      console.log('Video metadata loaded!');
      // Metadata has loaded, we have duration information
      // Update progress to at least 15% but respect time constraints
      updateProgressWithConstraints(Math.max(15, loadProgress));
    };
    
    const onLoadedData = () => {
      console.log('Video data loaded!');
      // First frame is loaded
      // Update progress to at least 30% but respect time constraints
      updateProgressWithConstraints(Math.max(30, loadProgress));
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
        // Still respect minimum time
        const elapsedTime = Date.now() - loadStartTimeRef.current;
        if (elapsedTime >= MIN_LOADING_TIME) {
          setLoadProgress(100);
        } else {
          // If min time hasn't elapsed, schedule completion
          const remainingTime = MIN_LOADING_TIME - elapsedTime;
          console.log(`Video - Scheduling completion in ${remainingTime}ms`);
          setTimeout(() => setLoadProgress(100), remainingTime);
        }
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
    
    // Smooth progress timer - ensures we don't get stuck if events don't fire properly
    loadingTimerRef.current = setInterval(() => {
      // Check if the video has made progress on its own
      const actualProgress = calculateVideoProgress(tempVideo);
      
      // Update progress with time constraints
      updateProgressWithConstraints(Math.max(actualProgress, loadProgress));
      
      // If we're at 100% or close to the max time, clear the timer
      if (loadProgress >= 100 || tempVideo.readyState >= 4) {
        if (loadingTimerRef.current) {
          clearInterval(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
      }
    }, 250); // Check more frequently (250ms instead of 500ms)
    
    // Final fallback - force completion after max time
    const finalFallbackTimer = setTimeout(() => {
      console.log('Final fallback timer triggered - forcing completion');
      setLoadProgress(100);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }, MAX_LOADING_TIME + 2000); // Max time plus buffer
    
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
  }, [videoSrc, loadProgress]);
  
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
    console.log('Preloader - Complete handler called');
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
