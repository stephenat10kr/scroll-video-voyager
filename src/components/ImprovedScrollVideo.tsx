
import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src: externalSrc }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : null);

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };
  
  // Set up the scroll animation when the video is loaded
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !videoSrc || !container || !isVideoLoaded) return;
    
    // Clean up any existing ScrollTrigger instances to prevent conflicts
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // Set video to initial state
    video.currentTime = 0;
    video.pause();
    
    console.log("Setting up scroll animation with video duration:", video.duration);
    
    // Adjust container height to allow for enough scrolling
    // Increase this value to make the scrubbing effect last longer
    container.style.height = `${window.innerHeight * 3}px`;
    
    // Create the GSAP timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5, // Smoother scrubbing
        markers: true, // Enable markers for debugging
        onUpdate: (self) => {
          console.log("ScrollTrigger progress:", self.progress);
        }
      }
    });
    
    // Animation to scrub through the video based on scroll position
    tl.to(video, { 
      currentTime: video.duration,
      ease: "none", // Linear animation
      duration: 1 // This is relative to the timeline, not seconds
    });
    
    // Handle touch devices
    const isTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    
    if (isTouchDevice()) {
      // Ensure a frame is displayed on touch devices by briefly playing then pausing
      video.play()
        .then(() => {
          // Set to the first frame
          video.currentTime = 0;
          video.pause();
        })
        .catch(err => console.log("Video play error:", err));
    }
    
    // Return cleanup function
    return () => {
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [videoSrc, isVideoLoaded]); // Dependencies include isVideoLoaded to ensure video is fully loaded

  return (
    <div 
      ref={containerRef}
      className="video-container fixed top-0 left-0 w-full h-screen z-0"
    >
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          playsInline 
          preload="auto"
          muted 
          onLoadedData={handleVideoLoaded}
        />
      )}
    </div>
  );
};

export default ImprovedScrollVideo;
