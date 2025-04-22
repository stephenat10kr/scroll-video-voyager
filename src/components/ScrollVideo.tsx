
import React, { useRef, useEffect } from "react";

// Placeholder video (user can replace with their own!)
// Use a short mp4 to avoid load issues, or let user upload their own later.
const VIDEO_SRC =
  "https://www.w3schools.com/html/mov_bbb.mp4"; // Example public sample video

const ScrollVideo: React.FC<{
  src?: string;
  title?: string;
  subtitle?: string;
}> = ({
  src = VIDEO_SRC,
  title = "Scroll to Scrub",
  subtitle = "Your story, frame by frame.",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Total scrollable height beyond the viewport
  const SCROLL_EXTRA_PX = 2000;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent user interaction with the native controls
    video.controls = false;
    video.pause();

    // On initial load, ensure video metadata is ready for duration.
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

      // Get relative scroll in section (0 = top, 1 = bottom)
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight - windowH;
      let scrollProgress =
        (scrollY - sectionTop) / (sectionHeight <= 0 ? 1 : sectionHeight);
      scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);

      // Seek to the appropriate time in the video
      const seekTime = scrollProgress * video.duration;
      if (Math.abs(video.currentTime - seekTime) > 0.05) {
        video.currentTime = seekTime;
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

  // Overlay text fade-out as user scrolls
  useEffect(() => {
    // Animate fade out of text as user scrolls halfway through section
    const onScroll = () => {
      const section = containerRef.current;
      if (!section) return;
      const overlay = document.getElementById("scroll-video-title");
      if (!overlay) return;
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      const start = windowH * 0.1;
      const end = windowH * 0.4;
      let opacity = 1;
      if (rect.top < start) {
        // Fade out between start and end scroll
        opacity = Math.max(
          0,
          1 - (Math.abs(rect.top - start) / (end - start))
        );
      }
      overlay.style.opacity = opacity.toString();
      overlay.style.transform = `translateY(${Math.max(0, -rect.top / 3)}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

      {/* Overlayed Title/Subitle */}
      <div
        id="scroll-video-title"
        className="absolute w-full left-0 top-1/4 transition-all duration-500 flex flex-col items-center z-10"
        style={{
          // Responsive top spacing
          transitionProperty: "opacity, transform",
        }}
      >
        <h1 className="text-white text-6xl md:text-8xl font-bold text-center drop-shadow-lg mb-4 animate-fade-in">
          {title}
        </h1>
        <p className="text-white text-2xl md:text-3xl opacity-80 font-light drop-shadow-md animate-fade-in">
          {subtitle}
        </p>
      </div>

      {/* Scroll Hint */}
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
    </div>
  );
};

export default ScrollVideo;

