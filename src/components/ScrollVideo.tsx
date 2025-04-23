
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

const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 800;

const ScrollVideo: React.FC<{
  src?: string;
}> = ({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(0);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Ensure the src is properly formatted for all devices
  const formattedSrc = src && (src.startsWith('//') ? `https:${src}` : src);

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
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX}
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={formattedSrc}
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
