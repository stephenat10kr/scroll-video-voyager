
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance to match hero text duration
const SCROLL_EXTRA_PX = 8000;

interface ImprovedScrollVideoProps {
  src?: string;
  onReady?: () => void;
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({
  src,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Ensure the src is secure (https)
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container || !secureVideoSrc) return;

    console.log("[ImprovedScrollVideo] Setting up for Android with source:", secureVideoSrc);

    // Set video properties
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.loop = false;

    // Android-specific optimizations
    video.style.transform = "translate3d(0,0,0)";
    video.style.willChange = "contents";
    video.style.backfaceVisibility = "hidden";

    // Set container height
    const resizeSection = () => {
      container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX}px`;
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const setupScrollTrigger = () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }

      // Always pause the video during setup
      video.pause();

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: 1.2, // Optimized for Android
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress) || !video.duration) return;

          // Calculate time to stop before the end
          const stopTimeBeforeEnd = 5 / 30; // 5 frames at 30fps
          let adjustedProgress = progress;
          
          if (progress > 0.98) {
            const maxTime = video.duration - stopTimeBeforeEnd;
            adjustedProgress = Math.min(progress, maxTime / video.duration);
          }

          const newTime = adjustedProgress * video.duration;
          
          // Use requestAnimationFrame for smooth updates
          requestAnimationFrame(() => {
            video.currentTime = newTime;
          });

          setIsAfterVideo(progress >= 1);
        }
      });

      console.log("[ImprovedScrollVideo] ScrollTrigger setup completed");
    };

    // Video event handlers
    const handleCanPlay = () => {
      console.log("[ImprovedScrollVideo] Video can play");
      if (onReady) {
        onReady();
      }
      video.pause(); // Ensure video stays paused
      setupScrollTrigger();
    };

    const handleLoadedData = () => {
      console.log("[ImprovedScrollVideo] Video data loaded");
      if (onReady && !video.duration) {
        onReady();
      }
    };

    const handleError = (e: Event) => {
      console.error("[ImprovedScrollVideo] Video error:", e);
      if (onReady) {
        onReady();
      }
    };

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    // Set video source
    if (video.src !== secureVideoSrc) {
      video.src = secureVideoSrc;
    }

    // Safety timeout
    const timeoutId = setTimeout(() => {
      console.log("[ImprovedScrollVideo] Safety timeout - setting up ScrollTrigger");
      if (!scrollTriggerRef.current) {
        setupScrollTrigger();
      }
      if (onReady) {
        onReady();
      }
    }, 500);

    return () => {
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      clearTimeout(timeoutId);
    };
  }, [secureVideoSrc, onReady]);

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

export default ImprovedScrollVideo;
