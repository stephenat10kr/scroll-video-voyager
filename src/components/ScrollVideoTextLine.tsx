
import React, { useEffect, useRef } from "react";

interface ScrollVideoTextLineProps {
  show: boolean;
  text: string;
  className?: string;
}

const ScrollVideoTextLine: React.FC<ScrollVideoTextLineProps> = ({
  show,
  text,
  className = "",
}) => {
  // Local state to trigger animation on enter
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      // Remove the animation class if already present so it can re-trigger
      ref.current.classList.remove("animate-bounce-in-up");
      // Force reflow to reset the animation
      void ref.current.offsetWidth;
      ref.current.classList.add("animate-bounce-in-up");
    } else if (!show && ref.current) {
      ref.current.classList.remove("animate-bounce-in-up");
    }
  }, [show, text]);

  return (
    <h1
      ref={ref}
      className={[
        "absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl md:text-8xl font-bold text-center drop-shadow-lg pointer-events-none transition-opacity duration-500",
        show ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
      style={{
        zIndex: show ? 2 : 1,
        pointerEvents: "none",
      }}
      aria-hidden={!show}
    >
      {text}
    </h1>
  );
};

export default ScrollVideoTextLine;
