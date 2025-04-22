
import React, { useRef, useEffect, useState } from "react";

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
  src = VIDEO_SRC,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = false;
    video.pause();

    let duration = 0;
    const handleLoaded = () => {
      duration = video.duration;
    };
    video.addEventListener("loadedmetadata", handleLoaded);

    // Scroll handler
    const handleScroll = () => {
      const section = containerRef.current;
      if (!section || !video.duration) return;
      const windowH = window.innerHeight;
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight - windowH;

      let scrollProgress =
        (scrollY - sectionTop) / (sectionHeight <= 0 ? 1 : sectionHeight);

      scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);

      // Corrected WORD TIMING: Each text gets exactly 1/5 of video duration
      // and 1/5 of scroll progress
      const SEGMENTS = SCROLL_TEXTS.length;
      // Calculate which fifth we're in. Each text gets an equal segment.
      const newTextIndex = Math.min(
        Math.floor(scrollProgress * SEGMENTS),
        SEGMENTS - 1
      );
      setCurrentTextIndex(newTextIndex);

      // Seek video
      const seekTime = scrollProgress * video.duration;
      if (Math.abs(video.currentTime - seekTime) > 0.05) {
        video.currentTime = seekTime;
      }

      // If we've scrolled past the end of the video, switch to after-video "absolute" mode so it scrolls away.
      if (scrollProgress >= 1) {
        setIsAfterVideo(true);
      } else {
        setIsAfterVideo(false);
      }
    };

    const resizeSection = () => {
      const section = containerRef.current;
      if (section) {
        section.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resizeSection);
    resizeSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

  // Determine where to place the video when scrolling is past the end
  // When isAfterVideo, set video to absolute at the bottom of scroll area
  // Otherwise, keep it fixed while scrolling video
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
        // Only fixed while before the end, else becomes absolute & remains visible at bottom of scroll area
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

      {/* Centered Overlayed Titles (each line is its own element, only overlays before end) */}
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
      {!isAfterVideo && (
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
      {/* This section remains for continued scrolling */}
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

