
import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "@/hooks/useIsIOS";

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
  const isIOS = useIsIOS();
  
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
  
  // Detect touch devices
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.maxTouchPoints > 0
    );
  };
  
  // Initialize video for iOS devices
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    if (isIOS) {
      console.log("iOS device detected, applying special video handling");
      
      // For iOS, we need to play and immediately pause to initialize the video
      // This helps with iOS's strict autoplay policies
      video.play().then(() => {
        video.pause();
        console.log("Successfully initialized video for iOS");
      }).catch(err => {
        console.error("Error initializing video for iOS:", err);
      });
    }
  }, [isVideoLoaded, isIOS]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    // For touch devices, we need to initialize the video first
    if (isTouchDevice() && !isIOS) { // Only run this for non-iOS touch devices
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
    // Using a more reliable selector targeting the section ID
    const revealTextSection = document.getElementById('revealText-section');
    if (revealTextSection) {
      console.log("RevealText section found for video visibility trigger");
      ScrollTrigger.create({
        trigger: revealTextSection,
        start: "top top", // This fires when the top of RevealText reaches the top of viewport
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
      console.warn("RevealText section not found for video visibility trigger");
      // Fallback to another selector if the ID approach fails
      const revealTextElement = document.querySelector('.w-full.py-24');
      if (revealTextElement) {
        console.log("Found RevealText using class selector");
        ScrollTrigger.create({
          trigger: revealTextElement,
          start: "top top",
          onEnter: () => {
            setIsVideoVisible(false);
            console.log("Hiding video (scrolling down) - using fallback selector");
          },
          onLeaveBack: () => {
            setIsVideoVisible(true);
            console.log("Showing video (scrolling up) - using fallback selector");
          },
          markers: false
        });
      } else {
        console.error("Could not find RevealText component with any selector");
      }
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
  }, [isVideoLoaded, isIOS]);

  return (
    <div ref={containerRef} className="video-container fixed top-0 left-0 w-full h-screen z-0">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          style={{ 
            opacity: isVideoVisible ? 1 : 0,
            visibility: isVideoVisible ? 'visible' : 'hidden'
          }}
          playsInline={true}
          webkit-playsinline="true"
          preload="auto"
          muted={true}
          controls={false}
          onLoadedData={handleVideoLoaded}
        >
          {/* Provide multiple source formats for better compatibility */}
          <source src={videoSrc} type="video/mp4" />
          {/* If we have WebM version available, we could add it here */}
          {/* <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" /> */}
        </video>
      )}
    </div>
  );
};

export default ImprovedScrollVideo;
