
import React from "react";
import ScrollVideo from "./ScrollVideo";

interface VideoProps {
  onVideoComplete?: () => void;
}

const Video: React.FC<VideoProps> = ({ onVideoComplete }) => {
  return (
    <ScrollVideo 
      src="https://videos.ctfassets.net/3ca7kmy7bi2k/1VGBBPgvLIZXktdboXT0RP/e8ee05130239957d3650fddd39d664ec/HeroTest_1-720-6keyframe.mp4" 
      onVideoComplete={onVideoComplete}
    />
  );
};

export default Video;
