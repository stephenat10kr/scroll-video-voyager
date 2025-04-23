
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Placeholder video (user can replace with their own!)
const VIDEO_SRC =
  "https://www.w3schools.com/html/mov_bbb.mp4"; // Example public sample video

const SCROLL_TEXTS = [
  "Welcome to Lightning Society",
  "Where",
  "Curiosity",
  "Meets",
  "Culture"
];

const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 800; // Black bg after video

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Set up GSAP ScrollTrigger for smooth video scrubbing
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    // Better playback performance settings
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();
    
    // Chrome-specific optimizations
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translateZ(0)";
    }

    // Resize the container to allow for scrolling
    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Wait for video metadata to load
    const setupScrollTrigger = () => {
      if (!video.duration) return;
      
      // Clear any existing ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }

      // Create GSAP ScrollTrigger for smooth video scrubbing
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: true, // Smooth scrubbing
        onUpdate: (self) => {
          // Smoothly update video time based on scroll progress
          const progress = self.progress;
          if (isNaN(progress) || !video.duration) return;
          
          // Use N+1 segments for buffer, where N = number of texts
          const SEGMENTS = SCROLL_TEXTS.length + 1;
          const segLen = 1 / SEGMENTS;

          // Determine which text index to show based on segment
          let textIdx: number | null = null;
          for (let i = 0; i < SCROLL_TEXTS.length; ++i) {
            if (progress >= segLen * i && progress < segLen * (i + 1)) {
              textIdx = i;
              break;
            }
          }
          if (progress >= segLen * SCROLL_TEXTS.length) {
            textIdx = null;
          }
          setCurrentTextIndex(textIdx);

          // Update video time based on scroll progress
          const seekTime = progress * video.duration;
          video.currentTime = seekTime;

          // Check if we're past the main video section
          setIsAfterVideo(progress >= 1);
        }
      });
    };

    // Set up ScrollTrigger once video metadata is loaded
    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      
      // Clean up ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  // Determine where to place the video when scrolling is past the end
  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={{ zIndex: 1 }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="auto"
        loop={false}
        muted
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
                top: `calc(${SCROLL_EXTRA_PX}px)`,
                position: "absolute",
              }
            : {}),
        }}
      />

      {/* Centered Overlayed Titles */}
      {!isAfterVideo && (
        <div
          id="scroll-video-title"
          className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"
        >
          {SCROLL_TEXTS.map((text, idx) => (
            <h1
              key={idx}
              className={[
                "absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl md:text-8xl font-bold text-center drop-shadow-lg pointer-events-none transition-all duration-500",
                "font-gt-super", // Apply the custom font
                idx === currentTextIndex
                  ? "opacity-100 animate-fade-in"
                  : "opacity-0"
              ].join(" ")}
              style={{
                zIndex: idx === currentTextIndex ? 2 : 1,
                pointerEvents: "none",
              }}
            >
              {text}
            </h1>
          ))}
        </div>
      )}

      {/* Scroll Hint */}
      {!isAfterVideo && currentTextIndex !== null && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="animate-bounce">
            <svg width="28" height="28" fill="none" className="mx-auto mb-1" viewBox="0 0 28 28">
              <path d="M14 20V8M14 20l-6-6M14 20l6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="block text-white text-base opacity-70 font-medium tracking-wide animate-fade-in">
            Scroll to explore
          </span>
        </div>
      )}

      {/* Below the fold: Black bg section after video is done */}
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
