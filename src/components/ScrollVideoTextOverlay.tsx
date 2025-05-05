
import React from "react";
import { useIsMobile } from "../hooks/use-mobile";

type ScrollVideoTextOverlayProps = {
  texts: string[];
  currentTextIndex: number | null;
};

const ScrollVideoTextOverlay: React.FC<ScrollVideoTextOverlayProps> = ({
  texts,
  currentTextIndex,
}) => {
  const isMobile = useIsMobile();
  
  // Return an empty div - no text overlay
  return (
    <div
      id="scroll-video-title"
      className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"
    >
      {/* Text overlay removed */}
    </div>
  );
};

export default ScrollVideoTextOverlay;
