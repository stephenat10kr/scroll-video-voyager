import React, { useState, useEffect, useRef, useCallback } from "react";
import ImprovedScrollVideo from "../components/ImprovedScrollVideo";
import HeroText from "../components/HeroText";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import ChladniPattern from "../components/ChladniPattern";
import { useIsAndroid } from "../hooks/use-android";
import { useIsIOS } from "../hooks/useIsIOS";
import Logo from "../components/Logo";
import Preloader from "../components/Preloader";
import ScrollVideo from "../components/ScrollVideo";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import colors from "../lib/theme";

const Index = () => {
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showChladniPattern, setShowChladniPattern] = useState(false);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [videoVisible, setVideoVisible] = useState(true);
  const [isAboveRevealText, setIsAboveRevealText] = useState(true); // State for z-index switching
  
  // Cache DOM element reference and throttling state
  const revealTextElementRef = useRef<HTMLElement | null>(null);
  const spacerElementRef = useRef<HTMLElement | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // Use the same video asset for all devices
  const videoAssetId = HERO_VIDEO_ASSET_ID; // Always use the new Hero Video Final
  const { data: videoAsset } = useContentfulAsset(videoAssetId);
  
  // Get video source from Contentful
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  // Force complete preloader after maximum time
  useEffect(() => {
    const maxLoadingTime = 8000; // 8 seconds max loading time
    const forceCompleteTimeout = setTimeout(() => {
      if (loadProgress < 100) {
        console.log("Force completing preloader after timeout");
        setLoadProgress(100);
      }
    }, maxLoadingTime);
    
    return () => clearTimeout(forceCompleteTimeout);
  }, []);
  
  // Simulate loading progress for testing - improved to reach 100% when video is ready
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    // Start with a small delay
    const startDelay = setTimeout(() => {
      progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          // If video is ready, jump directly to 100%
          if (videoReady) {
            clearInterval(progressInterval);
            return 100;
          }
          // Otherwise continue normal progress, but cap at 95%
          const newProgress = prev + Math.random() * 5;
          return Math.min(95, newProgress);
        });
      }, 200);
    }, 300); // Reduced from 500ms to 300ms for faster initial loading
    
    return () => {
      clearTimeout(startDelay);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [videoReady]);
  
  // When video is ready, immediately set progress to 100%
  useEffect(() => {
    if (videoReady) {
      console.log("Video is ready, immediately setting progress to 100%");
      setLoadProgress(100);
    }
  }, [videoReady]);
  
  // Enhanced debugging
  useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in Index component");
      console.log("User Agent:", navigator.userAgent);
    }
    
    if (isAndroid) {
      console.log("Android device detected in Index component");
      console.log("Using video asset ID:", HERO_VIDEO_ASSET_ID);
    }
  }, [isIOS, isAndroid]);
  
  // Throttled scroll handler using requestAnimationFrame for optimal performance
  const throttledScrollHandler = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastScrollTimeRef.current;
      
      // Throttle to maximum 60fps (16ms between updates)
      if (timeSinceLastUpdate < 16) return;
      
      lastScrollTimeRef.current = now;
      
      // Use cached element references
      if (!revealTextElementRef.current) {
        revealTextElementRef.current = document.getElementById('reveal-text-section');
      }
      
      // Update to look for hero-text-spacer instead
      if (!spacerElementRef.current) {
        spacerElementRef.current = document.getElementById('hero-text-spacer');
      }
      
      const revealTextElement = revealTextElementRef.current;
      const spacerElement = spacerElementRef.current;
      
      if (!revealTextElement || !spacerElement) return;
      
      // Get position of spacer element for all calculations
      const spacerRect = spacerElement.getBoundingClientRect();
      const revealTextRect = revealTextElement.getBoundingClientRect();
      
      // Add a small offset to ensure the pattern hides slightly before reaching the exact boundary
      const VISIBILITY_OFFSET = 10; // 10px offset
      
      // Determine if we're above the RevealText component
      // We're above if the RevealText section hasn't reached the top of the viewport yet
      const newIsAboveRevealText = revealTextRect.top > 0;
      
      // Video is visible only when spacer is below viewport top (with offset)
      const newVideoVisible = spacerRect.top > VISIBILITY_OFFSET;
      
      // Chladni pattern is visible only when:
      // 1. Spacer reaches or passes viewport top (with offset)
      // 2. AND we're below the RevealText section
      const newShowChladniPattern = spacerRect.top <= -VISIBILITY_OFFSET && !newIsAboveRevealText;
      
      // Debug logs to track state changes
      if (newVideoVisible !== videoVisible) {
        console.log(`Video visibility changed: ${newVideoVisible}, spacer top: ${spacerRect.top}`);
      }
      
      if (newShowChladniPattern !== showChladniPattern) {
        console.log(`Chladni pattern visibility changed: ${newShowChladniPattern}, spacer top: ${spacerRect.top}`);
      }
      
      if (newIsAboveRevealText !== isAboveRevealText) {
        console.log(`Position relative to RevealText changed: ${newIsAboveRevealText ? 'above' : 'below'}, RevealText top: ${revealTextRect.top}`);
      }
      
      let newFadeProgress = 0;
      
      // Calculate fade progress based on spacer element position
      // Fade should reach 100% when the top of the spacer reaches the top of the screen
      if (spacerRect.top <= 0) {
        // When spacer top is at or above viewport top, fade should be 100%
        newFadeProgress = 1;
      } else {
        // Calculate fade progress from spacer top approaching viewport top
        // We'll use the viewport height as our reference point for when to start fading
        const viewportHeight = window.innerHeight;
        const fadeStartDistance = viewportHeight; // Start fading when spacer is one viewport away
        
        if (spacerRect.top <= fadeStartDistance) {
          // Calculate progress from fadeStartDistance to 0
          const rawProgress = 1 - (spacerRect.top / fadeStartDistance);
          newFadeProgress = Math.min(Math.max(rawProgress, 0), 1);
        } else {
          newFadeProgress = 0;
        }
      }
      
      // Batch state updates to reduce re-renders
      setVideoVisible(newVideoVisible);
      setFadeProgress(newFadeProgress);
      setShowChladniPattern(newShowChladniPattern);
      setIsAboveRevealText(newIsAboveRevealText);
    });
  }, [videoVisible, showChladniPattern, isAboveRevealText]);
  
  // Set up optimized scroll listener
  useEffect(() => {
    // Cache the RevealText element on mount
    revealTextElementRef.current = document.getElementById('reveal-text-section');
    
    // Add throttled scroll listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Initial call to set correct state on page load
    throttledScrollHandler();
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [throttledScrollHandler]);
  
  const handlePreloaderComplete = () => {
    console.log("Preloader complete, fading in video");
    setLoading(false);
    // Start fading in the video
    setShowVideo(true);
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
  };
  
  const handleVideoReady = () => {
    console.log("Video is ready to display");
    setVideoReady(true);
  };
  
  return (
    <>
      {/* Background container that switches between video and Chladni pattern */}
      <div 
        className="fixed inset-0 w-full h-full" 
        style={{ 
          zIndex: 10, // Base z-index, stays consistent
          backgroundColor: "black", // Ensure black background 
        }}
      >
        {/* Chladni pattern with dynamic visibility and z-index */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: showChladniPattern ? 1 : 0,
            visibility: showChladniPattern ? 'visible' : 'hidden',
            transition: "opacity 0.3s ease-out, visibility 0.3s", // Smooth transition
            zIndex: isAboveRevealText ? 15 : 30, // Lower z-index when above RevealText, higher when below
            pointerEvents: showChladniPattern ? 'auto' : 'none' // Disable interaction when hidden
          }}
          className="chladni-container"
        >
          <ChladniPattern className="fixed inset-0" />
        </div>
        
        {/* Video with dynamic z-index */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: (showVideo && videoVisible) ? 1 : 0,
            transition: "opacity 0.3s ease-out", // Smooth CSS transition
            zIndex: isAboveRevealText ? 25 : 11, // Higher z-index when above RevealText, lower when below
            pointerEvents: videoVisible ? 'auto' : 'none'
          }}
        >
          {isAndroid ? (
            <ImprovedScrollVideo onReady={handleVideoReady} src={videoSrc} />
          ) : (
            <ScrollVideo onReady={handleVideoReady} src={videoSrc} />
          )}
        </div>
        
        {/* Dark green overlay with opacity controlled by fade progress */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: colors.darkGreen,
            opacity: fadeProgress, // FIXED: Always show based on scroll progress, not video visibility
            transition: "opacity 0.3s ease-out", // Smooth CSS transition
            zIndex: 20  // Between Chladni (15/30) and video (11/25)
          }}
        />
        
      </div>
      
      {/* Content overlay on top of everything */}
      <div 
        className="content-container relative z-40" // INCREASED: Content z-index highest of all (was 20)
        style={{ 
          backgroundColor: 'transparent', // Always transparent to let Chladni pattern show through
          position: 'relative' 
        }}
      >
        {/* Replaced logo section with HeroText component */}
        <section>
          <HeroText />
        </section>
        
        {/* RevealText component now includes the red spacer */}
        <section>
          <RevealText />
        </section>
        
        <section>
          <Values title="VALUES" />
        </section>
        
        <section>
          <Rituals title="RITUALS" />
        </section>
        
        <section>
          <Gallery title="SPACE" description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge." address="45 Howard St, New York, NY 10013" mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013" />
        </section>
        
        <section>
          <Questions title="QUESTIONS" />
        </section>
        
        <section>
          <Footer />
        </section>
      </div>
      
      {/* We no longer need this spacer since the Chladni pattern will cover all content */}
      <div className="w-full h-0" style={{ backgroundColor: colors.darkGreen }} />
      
      {/* Preloader (lowest z-index) - always rendered */}
      <Preloader progress={loadProgress} onComplete={handlePreloaderComplete} />
    </>
  );
};

export default Index;
