
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
      {/* 
        The HeroText component no longer accepts progress and containerRef props,
        so we're just rendering it without props now.
        If we need animated text overlays in the future, consider creating a specialized component.
      */}
      <HeroText />
    </div>
  );
};

export default ScrollVideoTextOverlay;
