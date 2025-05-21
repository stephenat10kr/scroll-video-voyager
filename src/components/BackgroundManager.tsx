
import React, { useState, useEffect } from "react";
import ChladniPattern from "./ChladniPattern";
import ImprovedScrollVideo from "./ImprovedScrollVideo";
import ScrollVideo from "./ScrollVideo";
import { useIsAndroid } from "../hooks/use-android";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID, HERO_VIDEO_PORTRAIT_ASSET_ID } from "@/types/contentful";

interface BackgroundManagerProps {
  showVideo: boolean;
  onVideoReady: () => void;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ 
  showVideo,
  onVideoReady 
}) => {
  const [showChladniPattern, setShowChladniPattern] = useState(false);
  const isAndroid = useIsAndroid();
  
  // Use appropriate video asset ID based on device
  const videoAssetId = isAndroid ? HERO_VIDEO_PORTRAIT_ASSET_ID : HERO_VIDEO_ASSET_ID;
  const { data: videoAsset } = useContentfulAsset(videoAssetId);
  
  // Get video source from Contentful
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  // Handle scroll-based switching between video and Chladni pattern
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollThreshold = window.innerHeight * 6; // 600vh (updated from 700vh)
      
      // When scrolled past threshold, show Chladni pattern and hide video
      if (scrollY >= scrollThreshold && !showChladniPattern) {
        console.log("Scroll threshold reached: Showing Chladni pattern");
        setShowChladniPattern(true);
      } 
      // When scrolled back up, hide Chladni pattern and show video
      else if (scrollY < scrollThreshold && showChladniPattern) {
        console.log("Scrolled back above threshold: Showing video");
        setShowChladniPattern(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Run once on mount to set initial state
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showChladniPattern]);

  return (
    <div 
      className="fixed inset-0 w-full h-screen" 
      style={{ 
        zIndex: 10,
        backgroundColor: "black", 
      }}
    >
      {/* Chladni pattern with instant display/hide */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showChladniPattern ? 1 : 0,
          zIndex: 11
        }}
      >
        <ChladniPattern />
      </div>
      
      {/* Video with instant display/hide */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: (showVideo && !showChladniPattern) ? 1 : 0,
          zIndex: 10
        }}
      >
        {isAndroid ? (
          <ImprovedScrollVideo onReady={onVideoReady} src={videoSrc} />
        ) : (
          <ScrollVideo onReady={onVideoReady} src={videoSrc} />
        )}
      </div>
    </div>
  );
};

export default BackgroundManager;
