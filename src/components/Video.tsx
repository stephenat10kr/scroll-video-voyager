
import React from "react";
import ScrollVideo from "./ScrollVideo";
import { useContentfulAsset } from "../hooks/useContentfulAsset";

const Video = () => {
  // Use the specific Contentful asset ID for the Drone video
  const { data: videoAsset, isLoading, error } = useContentfulAsset("77uUIlgXhePi9dHFFNkQvX");
  
  // Fallback to local video if Contentful asset is not available
  const videoSrc = videoAsset?.fields?.file?.url 
    ? `https:${videoAsset.fields.file.url}`
    : "/videos/HeroTest_1-720.mp4";
  
  // Log for debugging
  console.log('Video component - videoSrc:', videoSrc);
  console.log('Video component - asset data:', videoAsset);
  console.log('Video component - loading:', isLoading);
  console.log('Video component - error:', error);

  return (
    <ScrollVideo src={videoSrc} />
  );
};

export default Video;
