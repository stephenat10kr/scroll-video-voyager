
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
  
  return (
    <div
      id="scroll-video-title"
      className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"
    >
      {texts.map((text, idx) => (
        <h1
          key={idx}
          className={[
            "absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-7xl font-bold text-center pointer-events-none transition-all duration-500",
            "font-gt-super",
            isMobile ? "px-4" : "",
            idx === currentTextIndex
              ? "opacity-100 animate-fade-in"
              : "opacity-0"
          ].join(" ")}
          style={{
            zIndex: idx === currentTextIndex ? 2 : 1,
            pointerEvents: "none",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)"
          }}
        >
          {text}
        </h1>
      ))}
    </div>
  );
};

export default ScrollVideoTextOverlay;
