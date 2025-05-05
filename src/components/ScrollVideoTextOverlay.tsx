
import React from "react";
import ScrollVideoContent from "./ScrollVideoContent";

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
      <ScrollVideoContent progress={progress} containerRef={containerRef} />
    </div>
  );
};

export default ScrollVideoTextOverlay;
