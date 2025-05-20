
import React from "react";
import VideoLoader from "./video/VideoLoader";

const Video = () => {
  // Update the Contentful asset ID to use the Hero Video
  const contentfulAssetId = "5LzoveNWfrc4blO79Fr80U";
  
  return <VideoLoader contentfulAssetId={contentfulAssetId} />;
};

export default Video;
