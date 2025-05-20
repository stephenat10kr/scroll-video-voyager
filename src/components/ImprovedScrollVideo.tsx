
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

  // Check if we're running on iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

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

    // Add ScrollTrigger to control visibility based on RevealText component position
    const revealTextElement = document.querySelector('section > div[style*="backgroundColor: rgb(2, 72, 67)"]');
    if (revealTextElement) {
      ScrollTrigger.create({
        trigger: revealTextElement,
        start: "top top",
        onEnter: () => {
          setIsVideoVisible(false);
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          setIsVideoVisible(true);
          console.log("Showing video (scrolling up)");
        },
        markers: false
      });
    } else {
      console.warn("RevealText element not found for video visibility trigger");
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
  }, [isVideoLoaded]);

  // iOS specific video loading
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    
    const video = videoRef.current;
    
    // For iOS devices, we need special handling
    if (isIOS()) {
      console.log("iOS device detected, applying special video handling");
      
      // Make sure video is visible even before fully loaded on iOS
      setIsVideoVisible(true);
      
      // Set playsinline explicitly (important for iOS)
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x-webkit-airplay', 'allow');
      
      // Force video to load and show first frame
      const loadFirstFrame = () => {
        video.load();
        video.currentTime = 0.1;  // Set to a small non-zero value
        setIsVideoLoaded(true);
      };
      
      // Try different approaches to get the video showing
      loadFirstFrame();
      
      // Sometimes on iOS we need a user interaction
      const handleUserInteraction = () => {
        loadFirstFrame();
        // Try to play and immediately pause to kickstart the video
        video.play().then(() => {
          setTimeout(() => {
            video.pause();
          }, 100);
        }).catch(err => {
          console.log("iOS autoplay attempt failed:", err);
        });
      };
      
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [videoSrc]);

  return (
    <div ref={containerRef} className="video-container fixed top-0 left-0 w-full h-screen z-0">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && !isIOS() && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          style={{ opacity: isVideoVisible ? 1 : 0 }}
          playsInline 
          preload="auto"
          muted 
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          onLoadedData={handleVideoLoaded}
        />
      )}
    </div>
  );
};

export default ImprovedScrollVideo;
