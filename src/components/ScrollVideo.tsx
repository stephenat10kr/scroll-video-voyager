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

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src = VIDEO_SRC,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Total scrollable height beyond the viewport
  const SCROLL_EXTRA_PX = 2000;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent user interaction with the native controls
    video.controls = false;
    video.pause();

    let duration = 0;
    const handleLoaded = () => {
      duration = video.duration;
    };

    video.addEventListener("loadedmetadata", handleLoaded);

    // Handler to update video playback time based on scroll position
    const handleScroll = () => {
      const section = containerRef.current;
      if (!section || !video.duration) return;

      const rect = section.getBoundingClientRect();
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

      // There are 5 text steps, but we want each scroll to REVEAL one more line,
      // so at the end, all lines are visible:
      // We map scrollProgress (0 to 1) to (0 to SCROLL_TEXTS.length) using ceil.
      // But to not show the next line until you've scrolled enough, use Math.floor+1, capped.
      const linesVisible = Math.min(
        Math.floor(scrollProgress * SCROLL_TEXTS.length) + 1,
        SCROLL_TEXTS.length
      );
      setCurrentTextIndex(linesVisible);

      // Seek to the appropriate time in the video
      // For the video, let's play fully as you reveal all lines, and after that, scroll freely.
      const totalSteps = SCROLL_TEXTS.length;
      // only tie video to scroll while text is being revealed; after that, let page scroll with video paused at the end.
      if (linesVisible < totalSteps) {
        const seekTime =
          (scrollProgress * totalSteps / totalSteps) * video.duration;
        if (Math.abs(video.currentTime - seekTime) > 0.05) {
          video.currentTime = seekTime;
        }
      } else {
        // Once all lines are visible, keep video at end
        if (video.currentTime !== video.duration) {
          video.currentTime = video.duration;
        }
      }
    };

    // "Fake" scroll area: make container extra tall, so scroll can scrub whole video
    const resizeSection = () => {
      const section = containerRef.current;
      if (section) {
        section.style.height = `${window.innerHeight + SCROLL_EXTRA_PX}px`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resizeSection);

    // Setup on mount
    resizeSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, []);

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
        className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
        style={{ minHeight: "100vh" }}
      />

      {/* Overlayed Stacked Titles */}
      <div
        id="scroll-video-title"
        className="absolute w-full left-0 top-1/4 flex flex-col items-center z-10"
        style={{
          transitionProperty: "none",
        }}
      >
        {SCROLL_TEXTS.slice(0, currentTextIndex).map((line, i) => (
          <h1
            key={line}
            className="text-white text-4xl md:text-7xl font-bold text-center drop-shadow-lg mb-2 animate-fade-in"
            style={{
              // Slightly stagger the fade in
              animationDelay: `${i * 80}ms`
            }}
          >
            {line}
          </h1>
        ))}
      </div>

      {/* Scroll Hint */}
      {currentTextIndex < SCROLL_TEXTS.length && (
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
    </div>
  );
};

export default ScrollVideo;
