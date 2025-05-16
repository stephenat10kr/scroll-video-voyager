
import React from "react";
import HeroText from "./HeroText";

type ScrollVideoTextOverlayProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ScrollVideoTextOverlay: React.FC<ScrollVideoTextOverlayProps> = ({
  containerRef
}) => {
  return (
    <div id="scroll-video-title">
      <HeroText />
    </div>
  );
};

export default ScrollVideoTextOverlay;
