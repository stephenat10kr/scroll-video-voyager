
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import { useIsMobile } from "@/hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

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
  const isMobile = useIsMobile();

  const ensureHttps = (url?: string) => {
    if (!url) return undefined;
    // Make sure URL starts with https:// and not http:// or //
    let secureUrl = url
      .replace(/^\/\//, 'https://')
      .replace(/^http:/, 'https:')
      .replace(/^ws:/, 'wss:');
    
    // Add cache-busting parameter for mobile devices to prevent caching issues
    if (isMobile) {
      const cacheBuster = `cb=${Date.now()}`;
      secureUrl += (secureUrl.includes('?') ? '&' : '?') + cacheBuster;
    }
    
    return secureUrl;
  };

  const secureVideoSrc = ensureHttps(src);

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
          autoPlay={true}
          controls={true}
          className={
            (isAfterVideo ? "absolute" : "fixed") +
            " top-0 left-0 w-full h-full object-cover " + 
            (isMobile ? "" : "pointer-events-none ") +
            "z-0 bg-black transition-[position,top] duration-300"
          }
          style={{
            minHeight: "100vh",
            willChange: "contents",
            ...(isAfterVideo
              ? {
                  top: `calc(${SCROLL_EXTRA_PX}px)`,
                  position: "absolute",
                }
              : {}),
          }}
        />
      </ScrollVideoPlayer>

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
