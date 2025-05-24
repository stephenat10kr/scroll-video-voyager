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
import { HERO_VIDEO_ASSET_ID, HERO_VIDEO_PORTRAIT_ASSET_ID } from "@/types/contentful";
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
  
  // Use appropriate video asset ID based on device
  const videoAssetId = isAndroid ? HERO_VIDEO_PORTRAIT_ASSET_ID : HERO_VIDEO_ASSET_ID;
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
      console.log("Using portrait video asset ID:", HERO_VIDEO_PORTRAIT_ASSET_ID);
    }
  }, [isIOS, isAndroid]);
  
  // TEMPORARILY DISABLED: Scroll handler for video visibility logic
  // Throttled scroll handler using requestAnimationFrame for optimal performance
  const throttledScrollHandler = useCallback(() => {
    // TEMPORARILY DISABLED - keeping video always visible
    console.log("Scroll handler temporarily disabled - video always visible");
    return;
    
    // ... keep existing code (original scroll handler logic) commented out for now
  }, [videoVisible, showChladniPattern, isAboveRevealText]);
  
  // TEMPORARILY DISABLED: Set up optimized scroll listener
  useEffect(() => {
    // TEMPORARILY DISABLED - not setting up scroll listeners
    console.log("Scroll listeners temporarily disabled");
    
    // Keep video always visible for testing
    setVideoVisible(true);
    setShowChladniPattern(false);
    setFadeProgress(0);
    setIsAboveRevealText(true);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);
  
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
        
        {/* Video with dynamic z-index - TEMPORARILY ALWAYS VISIBLE */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: showVideo ? 1 : 0, // Removed videoVisible condition - always show when showVideo is true
            transition: "opacity 0.3s ease-out", // Smooth CSS transition
            zIndex: isAboveRevealText ? 25 : 11, // Higher z-index when above RevealText, lower when below
            pointerEvents: 'auto' // Always allow interaction when video is shown
          }}
        >
          {isAndroid ? (
            <ImprovedScrollVideo onReady={handleVideoReady} src={videoSrc} />
          ) : (
            <ScrollVideo onReady={handleVideoReady} src={videoSrc} />
          )}
        </div>
        
        {/* Dark green overlay with opacity controlled by fade progress - TEMPORARILY DISABLED */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: colors.darkGreen,
            opacity: 0, // TEMPORARILY SET TO 0 - was fadeProgress
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
        {/* Logo section at the top */}
        <section className="relative w-full h-screen flex flex-col justify-center items-center bg-transparent">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="flex flex-col items-center">
              <h2 className="title-sm text-roseWhite mb-0 text-center py-0">WELCOME TO</h2>
              <div className="flex justify-center items-center mt-12 w-full">
                <div className="w-[320px] md:w-[420px] lg:w-[520px] mx-auto">
                  <div className="aspect-w-444 aspect-h-213 w-full">
                    <Logo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Content sections */}
        <section>
          <HeroText skipLogoSection={true} />
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
