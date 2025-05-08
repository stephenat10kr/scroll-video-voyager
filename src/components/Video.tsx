
import React, { useEffect } from "react";
import ScrollVideo from "./ScrollVideo";
import { useContentfulAsset } from "../hooks/useContentfulAsset";

const Video = () => {
  // Use the specific Contentful asset ID for the scrub-optimized video
  const { data: videoAsset, isLoading, error } = useContentfulAsset("1A0xTn5l44SvzrObLYLQmG");
  
  // Use undefined as fallback instead of local video reference
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : undefined;
  
  // Log for debugging
  useEffect(() => {
    console.log('Video component - videoSrc:', videoSrc);
    console.log('Video component - asset data:', videoAsset);
    console.log('Video component - loading:', isLoading);
    console.log('Video component - error:', error);
  }, [videoAsset, isLoading, error, videoSrc]);

  return (
    <ScrollVideo src={videoSrc} />
  );
};

export default Video;
