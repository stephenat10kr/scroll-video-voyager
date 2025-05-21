import React, { useState, useEffect } from "react";
import ContentSections from "../components/ContentSections";
import Preloader from "../components/Preloader";
import BackgroundManager from "../components/BackgroundManager";
import { usePreloader } from "../hooks/usePreloader";
import { useIsIOS } from "../hooks/useIsIOS";
import { useIsAndroid } from "../hooks/use-android";
import { HERO_VIDEO_PORTRAIT_ASSET_ID } from "@/types/contentful";

const Index = () => {
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  const [videoReady, setVideoReady] = useState(false);
  
  const [preloaderState, handlePreloaderComplete] = usePreloader({
    onVideoReady: videoReady
  });
  
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
  
  const handleVideoReady = () => {
    console.log("Video is ready to display");
    setVideoReady(true);
  };
  
  return (
    <>
      {/* Content sections */}
      <ContentSections />
      
      {/* Background manager for video and chladni pattern */}
      <BackgroundManager 
        showVideo={preloaderState.showVideo} 
        onVideoReady={handleVideoReady}
      />
      
      {/* Preloader (lowest z-index) - always rendered */}
      <Preloader 
        progress={preloaderState.loadProgress} 
        onComplete={handlePreloaderComplete} 
      />
    </>
  );
};

export default Index;
