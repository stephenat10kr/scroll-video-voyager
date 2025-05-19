
import React, { useState, useEffect } from "react";
import ImprovedScrollVideo from "../components/ImprovedScrollVideo";
import HeroText from "../components/HeroText";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import ChladniPattern from "../components/ChladniPattern";
import useIsAndroid from "../hooks/useIsAndroid";
import { useIsIOS } from "../hooks/useIsIOS";
import Logo from "../components/Logo";
import Preloader from "../components/Preloader";
import ScrollVideo from "../components/ScrollVideo";
import AndroidScrollVideo from "../components/AndroidScrollVideo";

const Index = () => {
  // Updated: use direct import of useIsAndroid from the new file
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  
  // Force complete preloader after maximum time
  useEffect(() => {
    const maxLoadingTime = 12000; // 12 seconds max loading time
    const forceCompleteTimeout = setTimeout(() => {
      if (loadProgress < 100) {
        console.log("Force completing preloader after timeout");
        setLoadProgress(100);
      }
    }, maxLoadingTime);
    
    return () => clearTimeout(forceCompleteTimeout);
  }, [loadProgress]);
  
  // Simulate loading progress for testing
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    // Start with a small delay
    setTimeout(() => {
      progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          // If video is ready or we're close to timeout, allow reaching 100%
          const newProgress = prev + Math.random() * 5;
          return videoReady ? Math.min(100, newProgress) : Math.min(95, newProgress);
        });
      }, 200);
    }, 500);
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [videoReady]);
  
  // When video is ready, allow progress to reach 100%
  useEffect(() => {
    if (videoReady && loadProgress < 100) {
      console.log("Video is ready, completing progress to 100%");
      setLoadProgress(100);
    }
  }, [videoReady, loadProgress]);
  
  // Enhanced debugging
  useEffect(() => {
    // Log device information
    console.log("Device detection:");
    console.log("- iOS:", isIOS);
    console.log("- Android:", isAndroid);
    console.log("User Agent:", navigator.userAgent);
  }, [isIOS, isAndroid]);
  
  const handlePreloaderComplete = () => {
    console.log("Preloader complete, showing content");
    setLoading(false);
  };
  
  const handleVideoReady = () => {
    console.log("Video is ready to display");
    setVideoReady(true);
    
    // Ensure progress reaches 100% when video is ready
    setTimeout(() => {
      setLoadProgress(100);
    }, 500); // Short delay to ensure smooth transition
  };
  
  // Skip content rendering until preloader is done
  if (loading) {
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundColor: '#000' }} />
        <Preloader progress={loadProgress} onComplete={handlePreloaderComplete} />
        <div style={{ visibility: 'hidden', position: 'absolute' }}>
          {isAndroid ? (
            <AndroidScrollVideo onReady={handleVideoReady} />
          ) : isIOS ? (
            <ImprovedScrollVideo onReady={handleVideoReady} />
          ) : (
            <ScrollVideo onReady={handleVideoReady} />
          )}
        </div>
      </>
    );
  }
  
  // Choose the right video component based on device detection
  const VideoComponent = () => {
    if (isAndroid) {
      console.log("Using AndroidScrollVideo component");
      return <AndroidScrollVideo />;
    } else if (isIOS) {
      console.log("Using ImprovedScrollVideo component");
      return <ImprovedScrollVideo />;
    } else {
      console.log("Using standard ScrollVideo component");
      return <ScrollVideo />;
    }
  };
  
  return (
    <div className="min-h-screen w-full relative">
      {/* Background pattern (lowest z-index) */}
      <ChladniPattern />
      
      {/* Video fixed at the top (mid z-index) */}
      <VideoComponent />
      
      {/* Content overlay (high z-index, but below logo) */}
      <div className="content-container relative z-10">
        {/* Logo section at the top */}
        <section className="relative z-20 w-full h-screen flex flex-col justify-center items-center bg-transparent">
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
          {/* We skip the logo section since we've added it separately above */}
          <HeroText skipLogoSection={true} />
        </section>
        
        <section id="revealText-section">
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
    </div>
  );
};

export default Index;
