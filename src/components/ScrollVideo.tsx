import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_EXTRA_PX = 1000;
const AFTER_VIDEO_EXTRA_HEIGHT = 400;

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [textIndex, setTextIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        if (isMobile) {
          video.play().catch(err => {
            console.error("Mobile video play error:", err);
          });
        }
      };
      video.addEventListener("canplay", handleCanPlay);
      return () => video.removeEventListener("canplay", handleCanPlay);
    }
  }, [secureVideoSrc, isMobile]);

  return <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-black" style={{
    zIndex: 1
  }}>
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={5} 
        onTextIndexChange={setTextIndex} 
        onAfterVideoChange={setIsAfterVideo} 
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
      >
        <video ref={videoRef} src={secureVideoSrc} playsInline preload="auto" loop={false} muted tabIndex={-1} className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" style={{
        minHeight: "100vh",
        opacity: videoLoaded ? 1 : 0
      }} />
      </ScrollVideoPlayer>

      <ScrollVideoTextOverlay 
        texts={["Welcome to Lightning Society", "where", "curiosity", "meets", "culture"]} 
        currentTextIndex={textIndex} 
      />

      {!isAfterVideo && <ScrollVideoScrollHint />}
    </div>;
};

export default ScrollVideo;
