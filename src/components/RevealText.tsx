
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

    // Get the text content
    const originalText = text.textContent || "";
    
    // Split text into words and wrap each word in a span
    const formattedHTML = originalText.split(" ").map(word => 
      `<span class="word">${word}</span>`
    ).join('<span>&nbsp;</span>');
    
    text.innerHTML = formattedHTML;

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: text,
        start: "top bottom-=100",
        end: "bottom center",
        scrub: 0.5,
        markers: false
      }
    });

    // Select all word spans for animation
    const spans = text.querySelectorAll(".word");
    console.log(`Found ${spans.length} words to animate`);

    // Animate each word with a slight stagger
    spans.forEach((span, i) => {
      tl.to(span, {
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
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div 
          ref={textRef} 
          className="text-white font-gt-super text-7xl col-span-9"
          style={{
            background: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            lineHeight: "1.2",
            whiteSpace: "pre-wrap"
          }}
        >
          Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.
        </div>
      </div>
    </div>
  );
};

export default RevealText;
