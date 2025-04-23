
import React, { useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import ImageSequencePlayer from "./ImageSequencePlayer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useToast } from "@/hooks/use-toast";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Placeholder video (user can replace with their own!)
const VIDEO_SRC =
  "https://www.w3schools.com/html/mov_bbb.mp4";

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
  const isMobile = useIsMobile();
  const { toast } = useToast(); // Destructure to get the toast function
  
  useEffect(() => {
    // Log environment info for debugging
    console.log("ScrollVideo mounted");
    console.log("isMobile:", isMobile);
    console.log("Using:", isMobile ? "ImageSequencePlayer" : "ScrollVideoPlayer");
    console.log("Origin:", window.location.origin);
    
    // Display a toast if we're in mobile mode
    if (isMobile) {
      toast({
        title: "Mobile Experience",
        description: "Using image sequence player for better mobile performance",
      });
    }
    
    return () => {
      console.log("ScrollVideo unmounting");
    };
  }, [isMobile, toast]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={{ zIndex: 1 }}
    >
      {isMobile ? (
        <ImageSequencePlayer
          segmentCount={SCROLL_TEXTS.length}
          onTextIndexChange={setCurrentTextIndex}
          onAfterVideoChange={setIsAfterVideo}
          containerRef={containerRef}
          SCROLL_EXTRA_PX={SCROLL_EXTRA_PX}
          AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT}
        />
      ) : (
        <ScrollVideoPlayer
          src={src || VIDEO_SRC}
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
            src={src || VIDEO_SRC}
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
      )}

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
