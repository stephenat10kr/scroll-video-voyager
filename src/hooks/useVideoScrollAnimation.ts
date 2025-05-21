
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsAndroid } from "./use-android";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface UseVideoScrollAnimationOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isVideoLoaded: boolean;
}

export const useVideoScrollAnimation = ({
  videoRef,
  containerRef,
  isVideoLoaded
}: UseVideoScrollAnimationOptions) => {
  const isAndroid = useIsAndroid();
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        // Increase the end value to extend the scrolling length
        end: "bottom+=600% bottom", // Keep extended scrolling length
        // Use a much lower scrub value for Android devices to reduce lag
        scrub: isAndroid ? 0.5 : 3.5, // Lower value for Android for more responsive scrubbing
        markers: false, // Set to true for debugging
      }
    });
    
    // Wait until video metadata is loaded before creating the animation
    const handleMetadataLoaded = () => {
      if (video.duration) {
        timeline.to(video, { currentTime: video.duration });
        console.log("Video scroll animation set up with duration:", video.duration);
        console.log("Using scrub value:", isAndroid ? "0.5 (Android)" : "3.5 (non-Android)");
      }
    };
    
    if (video.readyState >= 2) {
      handleMetadataLoaded();
    } else {
      video.addEventListener('loadedmetadata', handleMetadataLoaded);
    }

    // Add ScrollTrigger to control visibility based on RevealText component position
    const revealTextSection = document.getElementById('revealText-section');
    if (revealTextSection) {
      console.log("RevealText section found for video visibility trigger");
      ScrollTrigger.create({
        trigger: revealTextSection,
        start: "top top", // This fires when the top of RevealText reaches the top of viewport
        onEnter: () => {
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          console.log("Showing video (scrolling up)");
        },
        markers: false
      });
    } else {
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
  }, [isVideoLoaded, isAndroid]);
};
