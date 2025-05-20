
import React, { useRef, useState, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import { useIsIOS } from "@/hooks/use-ios";
import { useVideoLoading } from "@/hooks/use-video-loading";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import ImprovedVideoContainer from "./video/ImprovedVideoContainer";
import ImprovedVideoElement from "./video/ImprovedVideoElement";

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src: externalSrc }) => {
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  const isIOS = useIsIOS();
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : "https://www.dropbox.com/scl/fi/qejf5dgqiv6m77d71r2ec/abstract-background-ink-water.mp4?rlkey=cf5xf73grwr5olszcyjghc5pt&st=ycgfiqec&raw=1");

  // Use our custom hooks
  const { isVideoLoaded, handleVideoLoaded } = useVideoLoading({
    videoRef,
    videoSrc
  });

  useScrollAnimation({
    videoRef,
    containerRef,
    isVideoLoaded,
    onVideoVisibilityChange: setIsVideoVisible
  });
  
  // Disable scrolling while preloader is active
  useEffect(() => {
    if (!isVideoLoaded) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVideoLoaded]);

  // Log for debugging
  console.log('Video component - videoSrc:', videoSrc);
  console.log('Video component - asset data:', heroVideoAsset);
  console.log('Video component - loading:', isLoading);
  console.log('Video component - progress:', isVideoLoaded ? 100 : 0);
  console.log('Video component - isIOS:', isIOS);

  return (
    <div ref={containerRef}>
      <ImprovedVideoContainer 
        isLoading={isLoading} 
        isVideoLoaded={isVideoLoaded} 
        isIOS={isIOS}
      >
        <ImprovedVideoElement
          videoRef={videoRef}
          videoSrc={videoSrc}
          isVideoVisible={isVideoVisible}
          handleVideoLoaded={handleVideoLoaded}
        />
      </ImprovedVideoContainer>
    </div>
  );
};

export default ImprovedScrollVideo;
