import React, { useState, useEffect, useRef } from "react";
import ScrollVideo from "./ScrollVideo";
import ImprovedScrollVideo from "./ImprovedScrollVideo";
import { useContentfulAsset } from "../hooks/useContentfulAsset";
import { useIsAndroid } from "../hooks/use-android";
import Preloader from "./Preloader";
import { HERO_VIDEO_ASSET_ID, HERO_VIDEO_PORTRAIT_ASSET_ID } from "@/types/contentful";

const Video = () => {
  // Use different video asset IDs based on device type
  const isAndroid = useIsAndroid();
  const videoAssetId = isAndroid ? HERO_VIDEO_PORTRAIT_ASSET_ID : HERO_VIDEO_ASSET_ID;
  
  console.log("Video component - Device detection:");
  console.log("- Is Android:", isAndroid);
  console.log("- Using asset ID:", videoAssetId);
  console.log("- Asset ID mappings:");
  console.log("  - HERO_VIDEO_ASSET_ID (landscape):", HERO_VIDEO_ASSET_ID);
  console.log("  - HERO_VIDEO_PORTRAIT_ASSET_ID (portrait):", HERO_VIDEO_PORTRAIT_ASSET_ID);
  
  // Use the appropriate video asset ID based on device type
  const { data: videoAsset, isLoading, error } = useContentfulAsset(videoAssetId);
  
  // Add detailed debugging for the asset data
  console.log("Video component - Detailed asset debugging:");
  console.log("- videoAsset raw:", videoAsset);
  console.log("- videoAsset fields:", videoAsset?.fields);
  console.log("- videoAsset file:", videoAsset?.fields?.file);
  console.log("- videoAsset url:", videoAsset?.fields?.file?.url);
  
  // Only use Contentful video source, with cache-busting parameter
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}?v=${Date.now()}`
    : undefined;
  
  console.log("Video component - Asset data:");
  console.log("- Video asset:", videoAsset);
  console.log("- Raw URL:", videoAsset?.fields?.file?.url);
  console.log("- Final video source:", videoSrc);
  console.log("- Loading state:", isLoading);
  console.log("- Error state:", error);
  
  const [loadProgress, setLoadProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoAttemptsRef = useRef(0);
  const maxVideoAttempts = 3;
  const progressValuesRef = useRef<number[]>([]);
  
  // Track when loading started
  const loadStartTimeRef = useRef<number>(Date.now());
  // Minimum loading time in milliseconds (3 seconds - changed from 6)
  const MIN_LOADING_TIME = 3000;
  // Maximum loading time before forcing completion
  const MAX_LOADING_TIME = 8000; // Also reduced from 15000 to 8000
  
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
  
  // Revised function to ensure progress increases steadily over time
  // and never regresses (Safari fix)
  const updateProgressWithConstraints = (actualProgress: number) => {
    // Calculate elapsed time since loading started
    const elapsedTime = Date.now() - loadStartTimeRef.current;
    
    // Time-based linear progress (0-100% over MIN_LOADING_TIME)
    // This ensures we always have forward progress even if video loading is stuck
    const timeBasedProgress = Math.min(100, (elapsedTime / MIN_LOADING_TIME) * 100);
    
    // Minimum progress threshold increasing over time
    const minProgressByTime = Math.min(95, Math.max(5, timeBasedProgress));
    
    // Store current progress value in our history array
    const prevProgress = loadProgress;
    const historicalMax = progressValuesRef.current.length > 0 
      ? Math.max(...progressValuesRef.current) 
      : 0;
    
    // Make sure progress never goes backward (Safari fix)
    let newProgress = Math.max(
      minProgressByTime,  // Time-based minimum threshold
      actualProgress,     // Actual video loading progress
      prevProgress,       // Previous progress value
      historicalMax       // Historical maximum progress we've reported
    );
    
    // Add to progress history
    progressValuesRef.current.push(newProgress);
    // Keep array at reasonable size
    if (progressValuesRef.current.length > 10) {
      progressValuesRef.current.shift();
    }
    
    console.log(`Video - Progress: ${newProgress.toFixed(1)}% (actual: ${actualProgress.toFixed(1)}%, time-based min: ${minProgressByTime.toFixed(1)}%)`);
    
    // After minimum time, accelerate toward completion
    if (elapsedTime > MIN_LOADING_TIME) {
      newProgress = Math.max(95, newProgress);
      
      // If we've exceeded minimum time by 10%, move to completion
      if (elapsedTime > MIN_LOADING_TIME * 1.1) {
        newProgress = 100;
        console.log('Video - Minimum time exceeded, completing');
      }
    }
    
    setLoadProgress(newProgress);
    
    // Force completion after maximum time
    if (elapsedTime > MAX_LOADING_TIME && newProgress < 100) {
      console.log('Video - Maximum loading time reached, completing');
      setLoadProgress(100);
    }
  };

  // Set up video loading detection
  useEffect(() => {
    // If we don't have a video source yet, don't attempt to track loading
    if (!videoSrc) {
      console.log('Video - No video source available yet');
      return;
    }
    
    console.log('Video - Starting loading sequence');
    console.log('Video - Video source URL:', videoSrc);
    console.log('Video - Using asset ID:', videoAssetId);
    console.log('Video - Is Android device:', isAndroid);
    
    // Reset the loading start time when the component mounts or source changes
    loadStartTimeRef.current = Date.now();
    // Reset progress history
    progressValuesRef.current = [];
    
    // Create a temporary video element to track loading
    const tempVideo = document.createElement('video');
    // Specifically disable Safari auto-play prevention by adding attributes
    tempVideo.setAttribute('playsinline', '');
    tempVideo.setAttribute('preload', 'auto');
    tempVideo.muted = true;
    
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
    }, MAX_LOADING_TIME + 1000); // Max time plus buffer
    
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

  // Enhanced debugging logs
  console.log('Video component - Current state:');
  console.log('- videoSrc:', videoSrc);
  console.log('- asset data:', videoAsset);
  console.log('- loading:', isLoading);
  console.log('- error:', error);
  console.log('- progress:', loadProgress);
  console.log('- isAndroid:', isAndroid);
  console.log('- using asset ID:', videoAssetId);

  // Don't render video components until we have a valid source
  if (isLoading) {
    console.log("Video component - Still loading, showing preloader only");
    return (
      <Preloader 
        progress={0} 
        onComplete={() => {}} 
      />
    );
  }

  if (error) {
    console.error("Video component - Error loading asset:", error);
    return <div>Error loading video</div>;
  }

  if (!videoSrc) {
    console.warn("Video component - No video source available");
    return <div>No video source available</div>;
  }

  return (
    <>
      {showPreloader && (
        <Preloader 
          progress={loadProgress} 
          onComplete={handlePreloaderComplete} 
        />
      )}
      {isAndroid ? (
        <ImprovedScrollVideo src={videoSrc} />
      ) : (
        <ScrollVideo src={videoSrc} />
      )}
    </>
  );
};

export default Video;
