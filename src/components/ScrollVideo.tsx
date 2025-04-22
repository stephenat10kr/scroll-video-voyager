import React, { useRef, useEffect, useState } from "react";

// Sequence of lines for the scroll
const SCROLL_TEXTS = [
  "Welcome to Lightning Society",
  "Where",
  "Curiosity",
  "Meets",
  "Culture"
];

// Placeholder video (user can replace with their own!)
const VIDEO_SRC = "https://www.w3schools.com/html/mov_bbb.mp4";

const ScrollVideo: React.FC<{ src?: string }> = ({
  src = VIDEO_SRC,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Current line index visible (only one shown at a time)
  const [currentIndex, setCurrentIndex] = useState(0);

  // To smoothly fade between lines
  const [fadeKey, setFadeKey] = useState(0);

  // Increase for more/less scroll space after video section
  const SCROLL_EXTRA_PX = 2000;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = false;
    video.pause();

    const handleLoaded = () => {};
    video.addEventListener("loadedmetadata", handleLoaded);

    const handleScroll = () => {
      const section = containerRef.current;
      if (!section || !video.duration) return;

      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      const windowH = window.innerHeight;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight - windowH;

      // Scroll progress in 0..1
      let scrollProgress =
        (scrollY - sectionTop) / (sectionHeight <= 0 ? 1 : sectionHeight);
      scrollProgress = Math.min(Math.max(scrollProgress, 0), 1);

      // Determine which line to show (each gets a segment of scroll)
      const steps = SCROLL_TEXTS.length;
      // "Step" is which text to show (0...steps-1)
      const step = Math.min(
        Math.floor(scrollProgress * steps),
        steps - 1
      );
      if (currentIndex !== step) {
        setCurrentIndex(step);
        setFadeKey(step); // For animation
      }

      // Video should play until last line appears, then pause at end
      if (step < steps - 1) {
        const seekTime =
          (scrollProgress * steps / steps) * video.duration;
        if (Math.abs(video.currentTime - seekTime) > 0.05) {
          video.currentTime = seekTime;
        }
      } else {
        // When at last text, set video to its end
        if (video.currentTime !== video.duration) {
          video.currentTime = video.duration;
        }
      }
    };

    // Make the section tall enough to allow enough scrolling
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
    };
    // eslint-disable-next-line
  }, [currentIndex]);

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

      {/* Overlayed SINGLE Line Title */}
      <div
        id="scroll-video-title"
        className="absolute w-full left-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
      >
        <TransitionText key={fadeKey} text={SCROLL_TEXTS[currentIndex]} />
      </div>

      {/* Scroll Hint only if not yet at final text */}
      {currentIndex < SCROLL_TEXTS.length - 1 && (
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
      {/* Add a black section below so user can keep scrolling */}
      <div className="w-full bg-black" style={{ height: `${SCROLL_EXTRA_PX}px` }} />
    </div>
  );
};

// Separated to provide a keyed fade transition every text change
const TransitionText: React.FC<{ text: string }> = ({ text }) => (
  <h1
    className="text-white text-4xl md:text-7xl font-bold text-center drop-shadow-lg mb-2 animate-fade-in"
    style={{
      animationDuration: "600ms",
      animationTimingFunction: "ease-in-out"
    }}
  >
    {text}
  </h1>
);

export default ScrollVideo;
