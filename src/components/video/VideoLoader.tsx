
import React from "react";
import { useContentfulAsset } from "../../hooks/useContentfulAsset";
import { useIsAndroid } from "../../hooks/use-android";
import Preloader from "../Preloader";
import ScrollVideo from "../ScrollVideo";
import ImprovedScrollVideo from "../ImprovedScrollVideo";
import { useVideoPreloader } from "../../hooks/use-video-preloader";

interface VideoLoaderProps {
  contentfulAssetId: string;
}

const VideoLoader: React.FC<VideoLoaderProps> = ({ contentfulAssetId }) => {
  // Get video asset from Contentful
  const { data: videoAsset, isLoading, error } = useContentfulAsset(contentfulAssetId);
  
  // Use undefined as fallback instead of local video reference
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  // Detect if the device is Android
  const isAndroid = useIsAndroid();
  
  // Use our preloading hook
  const { loadProgress, showPreloader, handlePreloaderComplete } = useVideoPreloader({
    videoSrc,
    minLoadingTimeMs: 6000,
    maxLoadingTimeMs: 15000
  });

  // Log for debugging
  console.log('Video component - videoSrc:', videoSrc);
  console.log('Video component - asset data:', videoAsset);
  console.log('Video component - loading:', isLoading);
  console.log('Video component - progress:', loadProgress);
  console.log('Video component - isAndroid:', isAndroid);

  return (
    <>
      {showPreloader && (
        <Preloader 
          progress={loadProgress} 
          onComplete={handlePreloaderComplete} 
        />
      )}
      {isAndroid ? (
        <ImprovedScrollVideo src={videoSrc} />
      ) : (
        <ScrollVideo src={videoSrc} />
      )}
    </>
  );
};

export default VideoLoader;
