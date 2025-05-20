import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "@/hooks/use-ios";

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
  const isIOS = useIsIOS(); // Use our custom iOS detection hook
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : "https://www.dropbox.com/scl/fi/qejf5dgqiv6m77d71r2ec/abstract-background-ink-water.mp4?rlkey=cf5xf73grwr5olszcyjghc5pt&st=ycgfiqec&raw=1");

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    if (isIOS) {
      console.log("Video loaded on iOS device");
    }
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
        trigger: document.body, // Use the entire body as trigger for iOS
        start: "top top",
        // Keep consistent 600vh scroll length for all devices
        end: "bottom+=600% bottom",
        scrub: isIOS ? 1.0 : 3.5, // Use lower scrub value for iOS for more precise scrolling
        markers: false, // Set to true for debugging
        onUpdate: (self) => {
          // Add progress logging for debugging iOS scroll issues
          if (isIOS && self.progress % 0.1 < 0.01) {
            console.log(`ScrollTrigger progress: ${Math.round(self.progress * 100)}%, Video time: ${video.currentTime}/${video.duration}`);
          }
        }
      }
    });
    
    // Wait until video metadata is loaded before creating the animation
    const handleMetadataLoaded = () => {
      if (video.duration) {
        // For iOS, we make a slight adjustment to ensure the video reaches the end
        const targetDuration = isIOS ? video.duration * 0.99 : video.duration;
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
    if (revealTextSection) {
      ScrollTrigger.create({
        trigger: revealTextSection,
        start: "top top", // When the top of revealText reaches the top of the viewport
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

  // iOS specific video loading
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    
    const video = videoRef.current;
    
    // For iOS devices, we need special handling
    if (isIOS) {
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
  }, [videoSrc, isIOS]);

  return (
    <div ref={containerRef} className="video-container fixed top-0 left-0 w-full h-screen z-0">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && !isIOS && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover pointer-events-none"
          style={{ display: isVideoVisible ? 'block' : 'none' }}
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
