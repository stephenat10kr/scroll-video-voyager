
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    const gradient = gradientRef.current;
    if (!text || !gradient) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom",
        end: "top center",
        scrub: true
      }
    });

    tl.fromTo(text, {
      y: 100,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 1
    });

    // Add gradient reveal animation
    tl.fromTo(gradient, {
      width: "0%"
    }, {
      width: "100%",
      duration: 1
    }, "<");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="w-full bg-black py-24">
      <div className="relative max-w-[90%] mx-auto">
        <p ref={textRef} className="text-white font-gt-super text-7xl opacity-0 transform translate-y-[100px]">
          Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.
        </p>
        <div 
          ref={gradientRef} 
          className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] via-[#8B5CF6] to-[#1EAEDB] mix-blend-overlay pointer-events-none"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  );
};

export default RevealText;
