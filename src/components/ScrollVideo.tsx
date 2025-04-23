
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import { useIsMobile } from "../hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const SCROLL_TEXTS = [
  "Welcome to Lightning Society",
  "Where",
  "Curiosity",
  "Meets",
  "Culture"
];

// Adjusted scroll values for better performance
const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 800;
// More conservative mobile values to reduce stuttering
const MOBILE_SCROLL_EXTRA_PX = 1200;
const MOBILE_AFTER_VIDEO_EXTRA_HEIGHT = 500;

const ScrollVideo: React.FC<{
  src?: string;
}> = ({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Get the appropriate scroll values based on device
  const scrollExtraPx = isMobile ? MOBILE_SCROLL_EXTRA_PX : SCROLL_EXTRA_PX;
  const afterVideoExtraHeight = isMobile ? MOBILE_AFTER_VIDEO_EXTRA_HEIGHT : AFTER_VIDEO_EXTRA_HEIGHT;

  // Ensure the src is properly formatted with https
  const formattedSrc = src 
    ? (src.startsWith('//') ? `https:${src}` : src.startsWith('http') ? src : `https://${src}`)
    : undefined;

  // Log the video source for debugging
  useEffect(() => {
    if (formattedSrc) {
      console.log("Video URL:", formattedSrc);
    }
    
    // Mobile-specific setup
    if (videoRef.current && isMobile) {
      // Immediately set crucial properties to prevent autoplay
      const video = videoRef.current;
      video.autoplay = false;
      video.controls = false;
      video.preload = "none"; // Most aggressive preload setting for mobile
      
      // Explicitly pause video and reset time
      video.pause();
      video.currentTime = 0;
      
      // Add additional mobile-specific attributes
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("playsinline", "true");
      video.setAttribute("x-webkit-airplay", "allow");
      video.setAttribute("preload", "none");
      
      // Set up a recurring pause mechanism
      const preventAutoplay = () => {
        video.pause();
      };
      
      // Catch all playback events
      video.addEventListener('play', preventAutoplay);
      video.addEventListener('playing', preventAutoplay);
      video.addEventListener('loadstart', preventAutoplay);
      
      // Safety pause for touch interactions
      document.addEventListener('touchstart', preventAutoplay, { once: true });
      
      return () => {
        video.removeEventListener('play', preventAutoplay);
        video.removeEventListener('playing', preventAutoplay);
        video.removeEventListener('loadstart', preventAutoplay);
        document.removeEventListener('touchstart', preventAutoplay);
      };
    }
  }, [formattedSrc, isMobile]);

  const handleVideoError = (error: string) => {
    console.error("Video error:", error);
    setVideoError(error);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={{ zIndex: 1 }}
    >
      {videoError && (
        <Alert variant="destructive" className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {videoError}
          </AlertDescription>
        </Alert>
      )}

      <ScrollVideoPlayer
        src={formattedSrc}
        segmentCount={SCROLL_TEXTS.length}
        onTextIndexChange={setCurrentTextIndex}
        onAfterVideoChange={setIsAfterVideo}
        onError={handleVideoError}
        videoRef={videoRef}
        containerRef={containerRef}
        SCROLL_EXTRA_PX={scrollExtraPx}
        AFTER_VIDEO_EXTRA_HEIGHT={afterVideoExtraHeight}
        isMobile={isMobile}
      >
        {/* Video with disabled autoplay and aggressive initial settings */}
        <video
          ref={videoRef}
          playsInline
          preload="none"
          muted
          loop={false}
          autoPlay={false}
          tabIndex={-1}
          className={
            (isAfterVideo
              ? "absolute"
              : "fixed"
            ) +
            " top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black transition-[position,top] duration-300"
          }
          style={{
            minHeight: "100vh",
            ...(isAfterVideo
              ? {
                  top: `calc(${scrollExtraPx}px)`,
                  position: "absolute",
                }
              : {}),
          }}
        />
      </ScrollVideoPlayer>

      {/* Centered Overlayed Titles */}
      {!isAfterVideo && (
        <ScrollVideoTextOverlay
          texts={SCROLL_TEXTS}
          currentTextIndex={currentTextIndex}
        />
      )}

      {/* Scroll Hint */}
      {!isAfterVideo && currentTextIndex !== null && (
        <ScrollVideoScrollHint />
      )}

      {/* Below the fold: Black bg section after video is done */}
      <div
        className="w-full bg-black"
        style={{
          height: `${afterVideoExtraHeight}px`,
          position: "absolute",
          top: `calc(100vh + ${scrollExtraPx}px)`,
          left: 0,
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default ScrollVideo;
