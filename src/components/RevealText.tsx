
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

const RevealText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const text = "Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.";

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    // Make the text visible initially
    gsap.set(textElement, { opacity: 1 });

    // Split text into lines based on actual line breaks
    const splitText = new SplitType(textElement, {
      types: 'lines',
      lineClass: 'split-line'
    });

    // Create wrapper for each line for gradient overlay
    splitText.lines?.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative';
      line.parentNode?.insertBefore(wrapper, line);
      wrapper.appendChild(line);

      // Create gradient overlay
      const gradient = document.createElement('div');
      gradient.className = 'gradient-overlay absolute inset-0 bg-gradient-to-r from-[#9b87f5] via-[#8B5CF6] to-[#1EAEDB] mix-blend-overlay pointer-events-none';
      gradient.style.width = '0%';
      wrapper.appendChild(gradient);
    });

    // Set initial styles for the lines - visible but without gradient
    gsap.set(splitText.lines, { 
      y: 0,
      opacity: 1,
      color: 'white'
    });

    // Animate each line
    splitText.lines?.forEach((line, index) => {
      const gradientElement = line.parentNode?.querySelector('.gradient-overlay');
      if (!gradientElement) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: `top+=${index * 50} bottom`,
          end: `top+=${index * 50 + 200} center`,
          scrub: true,
          markers: false, // Set to true for debugging
        }
      });

      // Animate gradient width only
      tl.fromTo(gradientElement, {
        width: "0%"
      }, {
        width: "100%",
        duration: 1
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      splitText.revert();
    };
  }, []);

  return (
    <div className="w-full bg-black py-24">
      <div ref={containerRef} className="max-w-[90%] mx-auto">
        <p 
          ref={textRef} 
          className="text-white font-gt-super text-7xl"
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default RevealText;
