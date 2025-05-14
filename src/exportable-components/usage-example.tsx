
import React from 'react';
import { Video } from './index';

// Example of how to use the Video component
const VideoExample = () => {
  return (
    <div className="bg-black">
      {/* Use with a direct video URL */}
      <Video videoSrc="/videos/your-video.mp4" />
      
      {/* OR use with Contentful */}
      {/* <Video contentfulAssetId="your-contentful-asset-id" /> */}
    </div>
  );
};

export default VideoExample;
