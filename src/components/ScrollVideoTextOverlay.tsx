
import React from "react";

type ScrollVideoTextOverlayProps = {
  texts: string[];
  currentTextIndex: number | null;
};

const ScrollVideoTextOverlay: React.FC<ScrollVideoTextOverlayProps> = ({
  texts,
  currentTextIndex,
}) => {
  return (
    <div
      id="scroll-video-title"
      className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"
    >
      {texts.map((text, idx) => (
        <h1
          key={idx}
          className={[
            "absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl md:text-8xl font-bold text-center pointer-events-none transition-all duration-500",
            "font-gt-super",
            idx === currentTextIndex
              ? "opacity-100 animate-fade-in"
              : "opacity-0"
          ].join(" ")}
          style={{
            zIndex: idx === currentTextIndex ? 2 : 1,
            pointerEvents: "none",
          }}
        >
          {text}
        </h1>
      ))}
    </div>
  );
};

export default ScrollVideoTextOverlay;
