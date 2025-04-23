
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import { useIsMobile } from "@/hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

// Fallback video if contentful video fails to load
const VIDEO_SRC = "https://www.w3schools.com/html/mov_bbb.mp4";

const SCROLL_TEXTS = [
  "Welcome to Lightning Society",
  "Where",
  "Curiosity",
  "Meets",
  "Culture"
];

const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 800;

const ScrollVideo: React.FC<{ src?: string }> = ({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDebugInfo, setVideoDebugInfo] = useState<Record<string, any>>({});
  const isMobile = useIsMobile();

  const ensureHttps = (url?: string) => {
    if (!url) return undefined;
    
    // Make sure URL starts with https:// and not http:// or //
    let secureUrl = url
      .replace(/^\/\//, 'https://')
      .replace(/^http:/, 'https:')
      .replace(/^ws:/, 'wss:');
    
    // For mobile, try to use a lower resolution version if available
    if (isMobile && secureUrl) {
      // Check if we can use a mobile-optimized version
      const fileExtMatch = secureUrl.match(/\.(mp4|webm|mov)$/i);
      if (fileExtMatch) {
        const ext = fileExtMatch[1].toLowerCase();
        // Try mobile optimized version (adding -mobile before extension)
        secureUrl = secureUrl.replace(
          new RegExp(`\\.(${ext})$`, 'i'), 
          `-mobile.${ext}`
        );
      }
      
      // Add cache-busting parameter
      const cacheBuster = `cb=${Date.now()}`;
      secureUrl += (secureUrl.includes('?') ? '&' : '?') + cacheBuster;
    }
    
    return secureUrl;
  };

  const secureVideoSrc = ensureHttps(src);

  // Debug log function to standardize logging
  const debugLog = (message: string, data?: any) => {
    console.log(`[📱 MobileVideo] ${isMobile ? 'MOBILE' : 'DESKTOP'}: ${message}`, data);
  };

  // Handle video load event
  const handleVideoLoaded = () => {
    debugLog("Video LOADED successfully");
    setVideoLoaded(true);
    updateVideoDebugInfo();
  };

  // Handle video error event
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const errorMsg = video.error ? 
      `Code: ${video.error.code}, Message: ${video.error.message}` : 
      'Unknown error';
    
    debugLog(`Video ERROR: ${errorMsg}`, {
      event: e,
      videoSrc: video.src,
      readyState: video.readyState,
      networkState: video.networkState
    });
    
    setVideoError(errorMsg);
    
    // Fallback to default video if loading fails
    if (videoRef.current && videoRef.current.src !== VIDEO_SRC) {
      debugLog("Trying fallback video");
      videoRef.current.src = VIDEO_SRC;
    }
  };

  // Function to update debug info
  const updateVideoDebugInfo = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const info = {
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      ended: video.ended,
      playbackRate: video.playbackRate,
      src: video.src,
      error: video.error ? 
        { code: video.error.code, message: video.error.message } : 
        null,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      offsetWidth: video.offsetWidth,
      offsetHeight: video.offsetHeight,
      clientWidth: video.clientWidth,
      clientHeight: video.clientHeight
    };
    
    setVideoDebugInfo(info);
    debugLog("Video state updated", info);
  };

  // Log when video becomes visible or hidden
  useEffect(() => {
    debugLog(`Video visibility changed: ${isAfterVideo ? 'HIDDEN' : 'VISIBLE'}`);
  }, [isAfterVideo]);

  // Add effect to check video status periodically
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Initial debug info
    debugLog("Component mounted", { 
      isMobile,
      secureVideoSrc, 
      originalSrc: src
    });
    
    const checkInterval = setInterval(() => {
      if (videoRef.current) {
        updateVideoDebugInfo();
      }
    }, 5000);
    
    return () => {
      clearInterval(checkInterval);
      debugLog("Component unmounting");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={{ zIndex: 1 }}
    >
      <ScrollVideoPlayer
        src={secureVideoSrc}
        segmentCount={SCROLL_TEXTS.length}
        onTextIndexChange={setCurrentTextIndex}
        onAfterVideoChange={setIsAfterVideo}
        videoRef={videoRef}
        containerRef={containerRef}
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX}
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT}
        debugLog={debugLog}
      >
        <video
          ref={videoRef}
          src={secureVideoSrc || VIDEO_SRC} 
          playsInline
          preload="auto"
          loop={false}
          muted
          tabIndex={-1}
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          onCanPlayThrough={() => debugLog("Video CAN PLAY through")}
          onSeeking={() => debugLog(`Video SEEKING to ${videoRef.current?.currentTime}`)}
          onSeeked={() => debugLog(`Video SEEKED to ${videoRef.current?.currentTime}`)}
          onStalled={() => debugLog("Video STALLED")}
          onTimeUpdate={() => isMobile && debugLog(`Video TIME UPDATE: ${videoRef.current?.currentTime}`)}
          className={
            "fixed top-0 left-0 w-full h-full object-cover " + 
            (isMobile ? "" : "pointer-events-none ") +
            "z-0 bg-black"
          }
          style={{
            minHeight: "100vh",
            willChange: "contents",
            transform: "translate3d(0,0,0)", // Force hardware acceleration
            backfaceVisibility: "hidden", // Additional optimization
            WebkitBackfaceVisibility: "hidden",
            visibility: "visible", // Always keep the video visible
            opacity: isAfterVideo ? 0 : 1, // Use opacity instead of visibility
            transition: "opacity 0.2s ease", // Smooth transition
          }}
        />
      </ScrollVideoPlayer>

      {/* Mobile debug overlay (only visible in development) */}
      {isMobile && import.meta.env.DEV && videoRef.current && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 overflow-y-auto max-h-[30vh]">
          <h4 className="font-bold">Video Debug:</h4>
          <div>
            <span className={videoLoaded ? "text-green-500" : "text-red-500"}>
              {videoLoaded ? "✓ Loaded" : "✗ Not Loaded"}
            </span>
            {videoError && <span className="text-red-500 ml-2">Error: {videoError}</span>}
          </div>
          <div>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(videoDebugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!isAfterVideo && (
        <ScrollVideoTextOverlay
          texts={SCROLL_TEXTS}
          currentTextIndex={currentTextIndex}
        />
      )}

      {!isAfterVideo && currentTextIndex !== null && (
        <ScrollVideoScrollHint />
      )}

      <div
        className="w-full bg-black"
        style={{
          height: `${AFTER_VIDEO_EXTRA_HEIGHT}px`,
          position: "absolute",
          top: `calc(100vh + ${SCROLL_EXTRA_PX}px)`,
          left: 0,
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default ScrollVideo;
