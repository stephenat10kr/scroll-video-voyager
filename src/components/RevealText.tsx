
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const RevealText = () => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const lines = text.querySelectorAll('.line-reveal');

    lines.forEach((line, index) => {
      gsap.to(line, {
        "--mask-position": "100%",
        duration: 2,
        ease: "none",
        scrollTrigger: {
          trigger: line,
          start: "top 80%",
          end: "bottom 60%",
          scrub: true,
          markers: false,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const text = "Lightning Society is a space where thinkers, builders and seekers gather. We're here to spark connection, explore possibility and illuminate new ways of being—together.";
  const lines = text.split('. ');

  return (
    <div className="w-full bg-black py-24">
      <div ref={textRef} className="max-w-[90%] mx-auto">
        {lines.map((line, index) => (
          <p
            key={index}
            className="line-reveal text-7xl font-gt-super relative mb-4 last:mb-0"
            style={{
              color: "white",
              WebkitMask: "linear-gradient(to right, #000 var(--mask-position), transparent var(--mask-position))",
              mask: "linear-gradient(to right, #000 var(--mask-position), transparent var(--mask-position))",
              "--mask-position": "0%",
              backgroundImage: "linear-gradient(to right, #FF6B6B, #FFE66D)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            } as React.CSSProperties}
          >
            {line}{index < lines.length - 1 ? '.' : ''}
          </p>
        ))}
      </div>
    </div>
  );
};

export default RevealText;

