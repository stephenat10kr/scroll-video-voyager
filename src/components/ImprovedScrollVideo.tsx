
import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src: externalSrc }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : "https://www.dropbox.com/scl/fi/qejf5dgqiv6m77d71r2ec/abstract-background-ink-water.mp4?rlkey=cf5xf73grwr5olszcyjghc5pt&st=ycgfiqec&raw=1");

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };
  
  // Detect touch devices - fixed the TypeScript error
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // Removed msMaxTouchPoints which was causing the TypeScript error
      navigator.maxTouchPoints > 0
    );
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
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
        scrub: 3.5, // Changed from 2.5 to 3.5 to add an even smoother delay effect
        markers: false, // Set to true for debugging
      }
    });
    
    // Wait until video metadata is loaded before creating the animation
    const handleMetadataLoaded = () => {
      if (video.duration) {
        timeline.to(video, { currentTime: video.duration });
        console.log("Video scroll animation set up with duration:", video.duration);
      }
    };
    
    if (video.readyState >= 2) {
      handleMetadataLoaded();
    } else {
      video.addEventListener('loadedmetadata', handleMetadataLoaded);
    }
    
    // Create a separate ScrollTrigger for video visibility
    // Using a different approach for visibility control
    const visibilityTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "600% bottom", // Hide when scrolled 600%
      onUpdate: (self) => {
        // Improved visibility handling
        // Using a threshold to make the transition more definitive
        const threshold = 0.98; // Adjusted threshold for better visibility control
        
        if (self.progress >= threshold) {
          // Only set if changing to prevent unnecessary re-renders
          if (isVideoVisible) setIsVideoVisible(false);
        } else {
          if (!isVideoVisible) setIsVideoVisible(true);
        }
        
        // Debug log
        if (self.progress > 0.9) {
          console.log("Visibility trigger progress:", self.progress, "Video visible:", isVideoVisible);
        }
      },
      markers: false, // Set to true for debugging
    });
    
    // Clean up
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
      visibilityTrigger.kill();
    };
  }, [isVideoLoaded, isVideoVisible]);

  return (
    <div 
      ref={containerRef} 
      className="video-container fixed top-0 left-0 w-full h-screen z-0"
      style={{
        opacity: isVideoVisible ? 1 : 0,
        transition: "opacity 1s ease-out",
        // Force hardware acceleration and improve performance
        transform: "translateZ(0)",
        visibility: isVideoVisible ? "visible" : "hidden", // Add visibility for better performance
        pointerEvents: "none", // Make sure it doesn't interfere with user interaction
      }}
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
          className="w-full h-full object-cover pointer-events-none"
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
