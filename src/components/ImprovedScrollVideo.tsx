
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
    
    if (!video || !videoSrc || !container) return;
    
    // Wait until video metadata is loaded to get the duration
    const handleMetadata = () => {
      // Ensure video is initially paused
      video.pause();
      
      // Adjust container height to allow for enough scrolling
      container.style.height = `${window.innerHeight + window.innerHeight * 2}px`;
      
      // Create the GSAP timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        }
      });
      
      // Animation to scrub through the video based on scroll position
      tl.to(video, { currentTime: video.duration });
      
      // Handle touch devices
      const isTouchDevice = () => {
        return (
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
        );
      };
      
      if (isTouchDevice()) {
        // Ensure a frame is displayed on touch devices by briefly playing then pausing
        video.play().then(() => video.pause()).catch(err => console.log("Video play error:", err));
      }
    };
    
    video.addEventListener('loadedmetadata', handleMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [videoSrc, isVideoLoaded]);

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
