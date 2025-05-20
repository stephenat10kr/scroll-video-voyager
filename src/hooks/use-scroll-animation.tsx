
import { useEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "./use-ios";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface UseScrollAnimationProps {
  videoRef: RefObject<HTMLVideoElement>;
  containerRef: RefObject<HTMLDivElement>;
  isVideoLoaded: boolean;
  onVideoVisibilityChange?: (isVisible: boolean) => void;
}

export const useScrollAnimation = ({
  videoRef,
  containerRef,
  isVideoLoaded,
  onVideoVisibilityChange
}: UseScrollAnimationProps) => {
  const isIOS = useIsIOS();
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    // Special handling for iOS devices
    if (isIOS) {
      console.log("Setting up iOS-specific video handling");
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
    }
    
    // For touch devices, we need to initialize the video first
    if (isTouchDevice()) {
      video.play().then(() => {
        video.pause();
      }).catch(err => {
        console.error("Error initializing video for touch device:", err);
      });
    }
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        // Increase the end value to extend the scrolling length
        // This makes the scrubbing effect less sensitive
        end: "bottom+=600% bottom", // Changed from 400% to 600% to make scrubbing much less sensitive
        scrub: isIOS ? 4.0 : 3.5, // Use higher scrub value for iOS for smoother scrolling
        markers: false, // Set to true for debugging
      }
    });
    
    // Wait until video metadata is loaded before creating the animation
    const handleMetadataLoaded = () => {
      if (video.duration) {
        // For iOS, we make a slight adjustment to ensure the video reaches the end
        const targetDuration = isIOS ? video.duration * 0.999 : video.duration;
        timeline.to(video, { currentTime: targetDuration });
        console.log("Video scroll animation set up with duration:", video.duration);
        if (isIOS) {
          console.log("Using iOS-adjusted target duration:", targetDuration);
        }
      }
    };
    
    if (video.readyState >= 2) {
      handleMetadataLoaded();
    } else {
      video.addEventListener('loadedmetadata', handleMetadataLoaded);
    }

    // Add ScrollTrigger to control visibility based on RevealText component position
    const revealTextSection = document.getElementById('revealText-section');
    if (revealTextSection && onVideoVisibilityChange) {
      ScrollTrigger.create({
        trigger: revealTextSection,
        start: "top top", // When the top of revealText reaches the top of the viewport
        onEnter: () => {
          onVideoVisibilityChange(false);
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          onVideoVisibilityChange(true);
          console.log("Showing video (scrolling up)");
        },
        markers: false
      });
    } else if (!revealTextSection) {
      console.warn("RevealText section not found for video visibility trigger");
    }
    
    // Clean up
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isVideoLoaded, isIOS, containerRef, videoRef, onVideoVisibilityChange]);
};

// Detect touch devices - fixed the TypeScript error
const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
};
