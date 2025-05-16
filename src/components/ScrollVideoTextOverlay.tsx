
import React, { useEffect, useRef } from "react";
import HeroText from "./HeroText";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoTextOverlayProps = {
  containerRef: React.RefObject<HTMLDivElement>;
};

const ScrollVideoTextOverlay: React.FC<ScrollVideoTextOverlayProps> = ({
  containerRef
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && overlayRef.current) {
      // Create a smooth scroll effect for the text overlay
      gsap.to(overlayRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        },
        y: 100,
        ease: "none"
      });
    }
  }, [containerRef]);

  return (
    <div id="scroll-video-title" ref={overlayRef}>
      <HeroText />
    </div>
  );
};

export default ScrollVideoTextOverlay;
