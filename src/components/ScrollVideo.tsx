
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

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src = VIDEO_SRC,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const snapPoints = useRef<number[]>([]);

  // Compute snap points on mount and resize
  useEffect(() => {
    const updateSnapPoints = () => {
      const section = containerRef.current;
      if (!section) return;
      const windowH = window.innerHeight;
      const sectionTop = section.offsetTop;

      const availableScroll =
        section.offsetHeight - windowH;
      // Snap point for each item, equally dividing the scrollable area
      const points: number[] = [];
      const count = SCROLL_TEXTS.length;
      for (let i = 0; i < count; i++) {
        points.push(
          Math.round(
            sectionTop + (availableScroll * i) / (count - 1)
          )
        );
      }
      snapPoints.current = points;
    };

    updateSnapPoints();
    window.addEventListener("resize", updateSnapPoints);
    return () => {
      window.removeEventListener("resize", updateSnapPoints);
    };
  }, []);

  // Video and scroll syncing
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

    let isSnapping = false;
    let snapTimeout: NodeJS.Timeout | null = null;

    // Handles scroll snapping and video scrubbing
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;

      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;

      // Find the nearest snap point
      const points = snapPoints.current;
      let nearestIdx = 0;
      let minDelta = Number.POSITIVE_INFINITY;
      points.forEach((pt, idx) => {
        const delta = Math.abs(scrollY - pt);
        if (delta < minDelta) {
          minDelta = delta;
          nearestIdx = idx;
        }
      });

      setCurrentTextIndex(nearestIdx);

      // Move video
      if (points.length > 1) {
        const progress = nearestIdx / (points.length - 1);
        const seekTime = progress * video.duration;
        if (Math.abs(video.currentTime - seekTime) > 0.05) {
          video.currentTime = seekTime;
        }
      }

      // Snap if not already snapping and user is close to point
      // Only snap when user is within 32px (tweakable)
      if (!isSnapping && minDelta > 1 && minDelta < 32) {
        isSnapping = true;
        window.scrollTo({
          top: points[nearestIdx],
          behavior: "smooth",
        });
        if (snapTimeout) clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
          isSnapping = false;
        }, 400); // lock snapping for 400ms
      }
    };

    // "Fake" scroll area -- extra height in container
    const resizeSection = () => {
      const section = containerRef.current;
      if (section) {
        section.style.height = `${window.innerHeight + SCROLL_EXTRA_PX}px`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resizeSection);
    resizeSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", handleLoaded);
      if (snapTimeout) clearTimeout(snapTimeout);
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

      {/* Overlayed Titles */}
      <div
        id="scroll-video-title"
        className="absolute w-full left-0 top-1/2 flex flex-col items-center z-10"
        style={{
          transform: "translateY(-50%)",
          transitionProperty: "none",
        }}
      >
        {SCROLL_TEXTS.map((text, idx) => (
          <h1
            key={idx}
            className={[
              "text-white text-6xl md:text-8xl font-bold text-center drop-shadow-lg mb-4 pointer-events-none absolute left-1/2 top-0 w-full transition-all duration-500",
              idx === currentTextIndex
                ? "opacity-100 translate-y-0 animate-fade-in"
                : "opacity-0 translate-y-10"
            ].join(" ")}
            style={{
              transform:
                idx === currentTextIndex
                  ? "translate(-50%, 0)"
                  : "translate(-50%, 40px)",
              zIndex: idx === currentTextIndex ? 2 : 1,
              pointerEvents: "none"
            }}
          >
            {text}
          </h1>
        ))}
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

