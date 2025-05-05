
import React from "react";
import HeroText from "./HeroText";

type ScrollVideoTextOverlayProps = {
  texts: string[];
  currentTextIndex: number | null;
  progress: number;
  containerRef: React.RefObject<HTMLDivElement>;
};

const ScrollVideoTextOverlay: React.FC<ScrollVideoTextOverlayProps> = ({
  texts,
  currentTextIndex,
  progress,
  containerRef
}) => {
  return (
    <div id="scroll-video-title">
      <HeroText progress={progress} containerRef={containerRef} />
    </div>
  );
};

export default ScrollVideoTextOverlay;
