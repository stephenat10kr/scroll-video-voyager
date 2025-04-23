
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    const container = containerRef.current;
    if (!text || !container) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom center",
        scrub: true
      }
    });

    tl.fromTo(text, {
      y: 100,
      opacity: 0,
      backgroundSize: "100% 0%"
    }, {
      y: 0,
      opacity: 1,
      backgroundSize: "100% 100%",
      duration: 1
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-black py-24">
      <p
        ref={textRef}
        className="text-white font-gt-super max-w-[90%] mx-auto opacity-0 transform translate-y-[100px] text-7xl"
        style={{
          backgroundImage: "linear-gradient(to right, #ee9ca7, #ffdde1)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "100% 0%",
          backgroundRepeat: "no-repeat"
        }}
      >
        Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.
      </p>
    </div>
  );
};

export default RevealText;
