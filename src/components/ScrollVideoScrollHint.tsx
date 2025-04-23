
import React from "react";

const ScrollVideoScrollHint: React.FC = () => (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
    <div className="animate-bounce">
      <svg width="28" height="28" fill="none" className="mx-auto mb-1" viewBox="0 0 28 28">
        <path d="M14 20V8M14 20l-6-6M14 20l6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <span className="block text-white text-base opacity-70 font-medium tracking-wide animate-fade-in">
      Scroll to explore
    </span>
  </div>
);

export default ScrollVideoScrollHint;
