
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    // Split text into characters with wrapper spans
    const chars = text.textContent?.split("") || [];
    text.innerHTML = chars.map(char => 
      char === " " ? "<span>&nbsp;</span>" : `<span>${char}</span>`
    ).join("");

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom-=100",
        end: "bottom center",
        scrub: 0.5,
        markers: false, // Set to true for debugging
        onUpdate: (self) => {
          console.log("ScrollTrigger progress:", self.progress);
        }
      }
    });

    // Select all spans for animation
    const spans = text.querySelectorAll("span");
    console.log(`Found ${spans.length} spans to animate`);

    // Animate each character with a slight stagger
    spans.forEach((span, i) => {
      tl.to(span, {
        backgroundImage: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
        backgroundClip: "text",
        webkitBackgroundClip: "text",
        color: "transparent",
        ease: "power1.inOut",
        duration: 0.1,
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
        style={{
          WebkitBackgroundClip: "initial",
          backgroundClip: "initial",
        }}
      >
        Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.
      </div>
    </div>
  );
};

export default RevealText;
