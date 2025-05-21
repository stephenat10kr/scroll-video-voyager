
import React, { useState, useEffect, useRef } from "react";
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
  const heroTextRef = useRef<HTMLElement | null>(null);
  
  // Use appropriate video asset ID based on device
  const videoAssetId = isAndroid ? HERO_VIDEO_PORTRAIT_ASSET_ID : HERO_VIDEO_ASSET_ID;
  const { data: videoAsset } = useContentfulAsset(videoAssetId);
  
  // Get video source from Contentful
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  // Find the HeroText component in the DOM
  useEffect(() => {
    // Look for HeroText section to observe
    const heroTextElement = document.querySelector('section:has(> div > section > div > div > h1.title-xl)');
    
    if (heroTextElement) {
      console.log("Found HeroText element for visibility tracking");
      heroTextRef.current = heroTextElement as HTMLElement;
    } else {
      console.warn("Could not find HeroText element");
    }
  }, []);
  
  // Set up intersection observer to detect when HeroText leaves/enters viewport
  useEffect(() => {
    if (!heroTextRef.current) return;
    
    const observerOptions = {
      root: null, // Use viewport as root
      rootMargin: "0px", // No margin
      threshold: 0.1 // Trigger when 10% of the element is visible/invisible
    };
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // When HeroText is no longer intersecting (out of view), show Chladni pattern
        if (!entry.isIntersecting && !showChladniPattern) {
          console.log("HeroText left viewport: Showing Chladni pattern");
          setShowChladniPattern(true);
        } 
        // When HeroText is intersecting (in view), show video
        else if (entry.isIntersecting && showChladniPattern) {
          console.log("HeroText entered viewport: Showing video");
          setShowChladniPattern(false);
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    observer.observe(heroTextRef.current);
    
    return () => {
      if (heroTextRef.current) {
        observer.unobserve(heroTextRef.current);
      }
      observer.disconnect();
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
