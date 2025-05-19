
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroText from "./HeroText";

gsap.registerPlugin(ScrollTrigger);

interface ImprovedScrollVideoProps {
  src?: string;
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Use a more direct approach for scroll video
  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    
    // Initialize video with optimal settings
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.setAttribute("webkit-playsinline", "true");

    // Android workaround - play and immediately pause to load first frame
    video.play().then(() => {
      video.pause();
      // Ensure we're showing the first frame
      video.currentTime = 0.001;
    }).catch(err => {
      console.log("Initial play failed:", err);
    });

    // Function to set up the timeline once video metadata is loaded
    const setupTimeline = () => {
      // Set up scroll trigger with a simpler configuration
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      timelineRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: heroTextRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          markers: false, // set to true for debugging
          onUpdate: (self) => {
            // Prevent update if video duration isn't available yet
            if (!video.duration || isNaN(video.duration)) return;
            
            // Direct calculation of currentTime based on scroll progress
            video.currentTime = self.progress * (video.duration - 0.001);
          }
        }
      });
    };

    // Set up event listeners for video loading
    const onMetadata = () => {
      console.log("ImprovedScrollVideo - Metadata loaded, duration:", video.duration);
      setupTimeline();
    };

    video.addEventListener("loadedmetadata", onMetadata);

    // Safety timeout in case events don't fire properly
    const safetyTimeout = setTimeout(() => {
      if (video.duration) {
        console.log("ImprovedScrollVideo - Safety timeout triggered with duration:", video.duration);
        setupTimeline();
      } else {
        console.log("ImprovedScrollVideo - Still no duration after timeout");
      }
    }, 1000);

    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      clearTimeout(safetyTimeout);
      
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [src]);

  return (
    <>
      <video 
        ref={videoRef}
        src={src}
        className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
        playsInline 
        preload="auto" 
        muted 
        style={{
          minHeight: "100vh",
          opacity: 1,
        }} 
      />
      
      <div 
        ref={heroTextRef}
        className="relative w-full"
        style={{ height: "500vh" }} // Set HeroText container to 500vh
      >
        <HeroText />
      </div>
    </>
  );
};

export default ImprovedScrollVideo;
