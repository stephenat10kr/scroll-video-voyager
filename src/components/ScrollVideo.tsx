
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
  const { toast } = useToast();
  const [playerError, setPlayerError] = useState(false);
  
  useEffect(() => {
    // Log environment info for debugging
    console.log("ScrollVideo mounted");
    console.log("isMobile:", isMobile);
    console.log("Using:", isMobile ? "ImageSequencePlayer" : "ScrollVideoPlayer");
    
    return () => {
      console.log("ScrollVideo unmounting");
    };
  }, [isMobile]);

  // Handle errors in either player
  const handlePlayerError = (message: string) => {
    console.error(`Player error: ${message}`);
    setPlayerError(true);
    toast({
      title: "Media loading error",
      description: message,
      variant: "destructive"
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={{ zIndex: 1 }}
    >
      {playerError ? (
        <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-8">
            <p className="text-xl font-bold mb-2">Media loading error</p>
            <p>Please check your connection and try again.</p>
          </div>
        </div>
      ) : isMobile ? (
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
          onError={handlePlayerError}
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
      {!isAfterVideo && !playerError && (
        <ScrollVideoTextOverlay
          texts={SCROLL_TEXTS}
          currentTextIndex={currentTextIndex}
        />
      )}

      {/* Scroll Hint */}
      {!isAfterVideo && currentTextIndex !== null && !playerError && (
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
