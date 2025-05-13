
import React, { forwardRef, useEffect, useRef } from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";
import { gsap } from "gsap";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
  isActive: boolean;
  isLast?: boolean;
}

const Value = forwardRef<HTMLDivElement, ValueProps>(({
  valueTitle,
  valueText,
  isActive,
  isLast = false
}, ref) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  // Animation effect when the value becomes active
  useEffect(() => {
    if (!isActive || !titleRef.current || !textContainerRef.current || !spinnerRef.current) return;
    
    // Create animation timeline
    const tl = gsap.timeline({ 
      defaults: { duration: 0.8, ease: "power3.out" }
    });
    
    // Reset positions
    gsap.set(titleRef.current, { opacity: 0, y: 50 });
    gsap.set(spinnerRef.current, { opacity: 0 });
    gsap.set(textContainerRef.current.children, { opacity: 0, y: 20 });
    
    // Animate elements in sequence
    tl.to(titleRef.current, { opacity: 1, y: 0 })
      .to(spinnerRef.current, { opacity: 1, duration: 0.5 }, "-=0.3")
      .to(textContainerRef.current.children, { 
        opacity: 1, 
        y: 0, 
        stagger: 0.15 
      }, "-=0.2");
      
    return () => {
      tl.kill();
    };
  }, [isActive]);

  return (
    <div 
      ref={ref}
      className={`w-full h-screen flex flex-col justify-center ${isLast ? '' : 'mb-6'}`}
      style={{
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.5s ease",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        visibility: isActive ? "visible" : "hidden"
      }}
    >
      <h2 
        ref={titleRef}
        className="title-md mb-6 text-center py-[56px]" 
        style={{ color: colors.coral }}
      >
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div ref={spinnerRef} className="flex justify-center">
        <Spinner />
      </div>
      
      <div ref={textContainerRef} className="space-y-1">
        {valueText.map((text, index) => (
          <p 
            key={index} 
            className="title-sm text-center" 
            style={{ color: colors.coral }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
});

Value.displayName = "Value";

export default Value;
