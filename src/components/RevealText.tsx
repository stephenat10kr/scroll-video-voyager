
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    const gradient = gradientRef.current;
    if (!text || !gradient) return;

    const chars = text.textContent?.split("") || [];
    text.innerHTML = chars.map(char => `<span>${char}</span>`).join("");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom",
        end: "bottom center",
        scrub: 1,
      }
    });

    // Animate each character
    const spans = text.querySelectorAll("span");
    spans.forEach((span, i) => {
      tl.to(span, {
        backgroundImage: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
        backgroundClip: "text",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
        duration: 0.05,
      }, i * 0.01);
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="w-full bg-black py-24">
      <div 
        ref={textRef} 
        className="text-white font-gt-super max-w-[90%] mx-auto text-7xl"
      >
        Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.
      </div>
    </div>
  );
};

export default RevealText;
