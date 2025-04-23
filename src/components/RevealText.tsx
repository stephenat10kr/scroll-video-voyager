
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const RevealText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLSpanElement[]>([]);

  // Split text into lines for individual animation
  const text = "Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.";
  const lines = text.split('. ');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || lineRefs.current.length === 0) return;

    // Create a timeline for each line
    lineRefs.current.forEach((lineRef, index) => {
      const gradientElement = lineRef.querySelector('.gradient-overlay');
      
      if (!gradientElement) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: `top+=${index * 50} bottom`,
          end: `top+=${index * 50 + 200} center`,
          scrub: true,
        }
      });

      // Animate each line from hidden to visible
      tl.fromTo(lineRef, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.5
      });

      // Animate gradient width from 0 to 100%
      tl.fromTo(gradientElement, {
        width: "0%"
      }, {
        width: "100%",
        duration: 1
      }, "<0.2");
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="w-full bg-black py-24">
      <div ref={containerRef} className="max-w-[90%] mx-auto space-y-6">
        {lines.map((line, index) => (
          <div key={index} className="relative overflow-hidden">
            <span 
              ref={el => {
                if (el) lineRefs.current[index] = el;
              }}
              className="block text-white font-gt-super text-7xl opacity-0 transform translate-y-[50px]"
            >
              {line}{index < lines.length - 1 ? '.' : ''}
              <div 
                className="gradient-overlay absolute inset-0 bg-gradient-to-r from-[#9b87f5] via-[#8B5CF6] to-[#1EAEDB] mix-blend-overlay pointer-events-none"
                style={{ width: "0%" }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealText;
