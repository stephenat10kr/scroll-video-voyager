
import React, { useState, useEffect, useRef } from "react";
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
import ImageSequenceScrubber from "@/components/ImageSequenceScrubber";
import { useContentfulImageSequence } from "@/hooks/useContentfulImageSequence";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showChladniPattern, setShowChladniPattern] = useState(false);
  const [hasPassedMarker, setHasPassedMarker] = useState(false); 
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Use appropriate video asset ID based on device
  const videoAssetId = isAndroid ? HERO_VIDEO_PORTRAIT_ASSET_ID : HERO_VIDEO_ASSET_ID;
  const { data: videoAsset } = useContentfulAsset(videoAssetId);
  
  // Fetch the image sequence for Android devices
  const { data: imageUrls = [], isLoading: imagesLoading, isError: imageError } = useContentfulImageSequence({
    tag: "heroSequence",
    prefix: "LS_HeroSequence"
  });
  
  // Get video source from Contentful
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
    
  // Log image sequence status
  useEffect(() => {
    if (isAndroid) {
      if (imagesLoading) {
        console.log("Loading image sequence for Android device...");
      } else {
        console.log(`Image sequence loaded: ${imageUrls.length} frames`);
        
        // Show error toast if no images were found
        if (imageUrls.length === 0 || imageError) {
          toast({
            title: "Warning",
            description: "Could not load all image frames. Using fallback image.",
            variant: "destructive",
          });
        }
      }
    }
  }, [isAndroid, imageUrls.length, imagesLoading, imageError]);
  
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
      console.log("User Agent:", navigator.userAgent);
      console.log("Using portrait video asset ID:", HERO_VIDEO_PORTRAIT_ASSET_ID);
      console.log("Image sequence URLs count:", imageUrls.length);
      if (imageUrls.length > 0) {
        console.log("First image URL:", imageUrls[0]);
        console.log("Last image URL:", imageUrls[imageUrls.length - 1]);
      }
    }
  }, [isIOS, isAndroid, imageUrls]);
  
  // Set up Intersection Observer for reliable transition between video and Chladni pattern
  useEffect(() => {
    // Wait for the component to be fully mounted
    const setupObserver = () => {
      // Find our marker element
      const markerElement = document.getElementById('chladni-transition-marker');
      
      if (!markerElement) {
        console.log("Transition marker element not found, retrying in 500ms");
        setTimeout(setupObserver, 500);
        return;
      }
      
      console.log("Setting up Intersection Observer for transition marker");
      
      // Create new Intersection Observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          
          if (entry.isIntersecting && !hasPassedMarker) {
            console.log("Marker intersecting viewport - showing Chladni pattern");
            setShowChladniPattern(true);
            setHasPassedMarker(true); // Set flag to remember we've passed the marker
          } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            // Only hide pattern if we're scrolling UP past the marker (top > 0)
            console.log("Scrolled above marker - showing video again");
            setShowChladniPattern(false);
            setHasPassedMarker(false); // Reset our marker flag
          }
          // Do nothing when scrolling down past the marker - keep pattern visible
        },
        {
          // Adjust threshold to fine-tune when the transition happens
          threshold: 0.1,
          // Use the viewport as the root
          root: null
        }
      );
      
      // Start observing the marker element
      observerRef.current.observe(markerElement);
      console.log("Intersection Observer started watching marker element");
    };
    
    // Start setting up the observer
    setupObserver();
    
    // Cleanup function
    return () => {
      if (observerRef.current) {
        console.log("Cleaning up Intersection Observer");
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasPassedMarker]); // Added hasPassedMarker to the dependency array
  
  const handlePreloaderComplete = () => {
    console.log("Preloader complete, fading in video");
    setLoading(false);
    // Start fading in the video
    setShowVideo(true);
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
  };
  
  const handleVideoReady = () => {
    console.log("Video or image sequence is ready to display");
    setVideoReady(true);
  };
  
  // Debug information for Android image sequence
  console.log("Android device detected:", isAndroid);
  console.log("Using image sequence instead of video:", isAndroid);
  
  // Create a marker element for the transition point
  useEffect(() => {
    // Check if marker already exists
    if (!document.getElementById('chladni-transition-marker')) {
      // Create a marker element at a specific point in the page
      const marker = document.createElement('div');
      marker.id = 'chladni-transition-marker';
      marker.style.position = 'absolute';
      marker.style.top = '200vh'; // Position it 2 viewport heights down
      marker.style.height = '1px';
      marker.style.width = '100%';
      marker.style.visibility = 'hidden';
      document.body.appendChild(marker);
      
      console.log("Created chladni transition marker element");
      
      return () => {
        // Clean up marker on component unmount
        const existingMarker = document.getElementById('chladni-transition-marker');
        if (existingMarker) {
          document.body.removeChild(existingMarker);
        }
      };
    }
  }, []);
  
  return (
    <>
      {/* Background container that switches between video and Chladni pattern */}
      <div 
        className="fixed inset-0 w-full h-full" 
        style={{ 
          zIndex: 10,
          backgroundColor: "black", 
        }}
      >
        {/* Video with instant transition - Android gets image sequence instead */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: (showVideo && !showChladniPattern) ? 1 : 0,
            transition: "opacity 0s",
            zIndex: 10
          }}
        >
          {isAndroid ? (
            <ImageSequenceScrubber
              imageUrls={imageUrls}
              onReady={handleVideoReady}
            />
          ) : isIOS ? (
            <ImprovedScrollVideo onReady={handleVideoReady} src={videoSrc} />
          ) : (
            <ScrollVideo onReady={handleVideoReady} src={videoSrc} />
          )}
        </div>
        
        {/* Chladni pattern with instant transition - now covers all content */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: showChladniPattern ? 1 : 0,
            transition: "opacity 0s",
            zIndex: 11
          }}
          className="chladni-container"
        >
          <ChladniPattern className="fixed inset-0" />
        </div>
      </div>
      
      {/* Content overlay on top of everything */}
      <div 
        className="content-container relative z-20"
        style={{ backgroundColor: 'transparent', position: 'relative' }}
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
