
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_EXTRA_PX = 4000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
  onReady?: () => void;
}> = ({
  src,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const setupCompleted = useRef(false);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container || !secureVideoSrc) return;

    console.log("Setting up ScrollVideo with src:", secureVideoSrc);

    // Clean up any existing scroll triggers
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }

    // Reset setup flag
    setupCompleted.current = false;

    // Configure video
    video.src = secureVideoSrc;
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // Set container height
    container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;

    const setupScrollTrigger = () => {
      if (setupCompleted.current || !video.duration || !isFinite(video.duration)) {
        return;
      }

      console.log(`Setting up ScrollTrigger with video duration: ${video.duration}s`);

      const scrubValue = isAndroid ? 1.8 : (isMobile ? 1.0 : 0.8);
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress) || progress < 0 || progress > 1) return;
          
          // Much more aggressive safety buffer - exclude last 1.5 seconds and never exceed 85% of video
          const safeEndBuffer = Math.min(1.5, video.duration * 0.15); // At least 15% buffer or 1.5 seconds
          const maxSafeTime = Math.max(0, video.duration - safeEndBuffer);
          const maxProgress = 0.85; // Never go beyond 85% of the video to avoid end issues
          
          // Map progress to the safe portion only
          const safeProgress = Math.min(progress, maxProgress);
          const targetTime = safeProgress * maxSafeTime;
          
          // Triple safety check
          const finalTime = Math.min(Math.max(0, targetTime), maxSafeTime);
          
          try {
            // Only update if the time is significantly different to reduce flicker
            if (Math.abs(video.currentTime - finalTime) > 0.05) {
              video.currentTime = finalTime;
            }
            console.log(`Video scrub: progress=${progress.toFixed(4)}, safeProgress=${safeProgress.toFixed(4)}, time=${finalTime.toFixed(3)}/${video.duration.toFixed(3)} (max safe: ${maxSafeTime.toFixed(3)})`);
          } catch (error) {
            console.warn("Error updating video time:", error);
          }
        }
      });

      setupCompleted.current = true;
      setIsVideoReady(true);
      
      if (onReady) {
        onReady();
      }

      console.log("ScrollTrigger setup completed");
    };

    const handleVideoReady = () => {
      console.log("Video ready:", { readyState: video.readyState, duration: video.duration });
      
      // Simple check - if we have a valid duration, set up the trigger
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        setupScrollTrigger();
      }
    };

    // Wait for video to be ready
    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      setupScrollTrigger();
    } else {
      video.addEventListener('loadedmetadata', handleVideoReady);
      video.addEventListener('canplay', handleVideoReady);
    }

    // Cleanup
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      video.removeEventListener('loadedmetadata', handleVideoReady);
      video.removeEventListener('canplay', handleVideoReady);
      setupCompleted.current = false;
    };
  }, [secureVideoSrc, isMobile, isAndroid, onReady]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      <video 
        ref={videoRef}
        playsInline 
        preload="auto" 
        loop={false} 
        muted 
        tabIndex={-1} 
        className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none bg-black" 
        style={{
          minHeight: "100vh",
          backgroundColor: "black",
          display: "block",
          visibility: "visible"
        }} 
      />
    </div>
  );
};

export default ScrollVideo;
