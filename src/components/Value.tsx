
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
  const prevActiveRef = useRef<boolean>(false);

  // Animation effect when the value becomes active
  useEffect(() => {
    if (!titleRef.current || !textContainerRef.current || !spinnerRef.current) return;
    
    // Store previous state
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = isActive;
    
    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf([titleRef.current, spinnerRef.current, textContainerRef.current.children]);
    
    if (isActive) {
      // If becoming active, animate in
      gsap.set(titleRef.current, { opacity: 0, y: 50 });
      gsap.set(spinnerRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(textContainerRef.current.children, { opacity: 0, y: 30 });
      
      const tl = gsap.timeline({ 
        defaults: { duration: 0.5, ease: "power2.out" }
      });
      
      tl.to(titleRef.current, { 
        opacity: 1, 
        y: 0,
        duration: 0.6
      })
      .to(spinnerRef.current, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.4
      }, "-=0.3")
      .to(textContainerRef.current.children, { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1,
        duration: 0.5
      }, "-=0.2");
    } else if (wasActive) {
      // If was active but now inactive, animate out quickly
      gsap.to([titleRef.current, spinnerRef.current, textContainerRef.current.children], {
        opacity: 0,
        y: 20,
        duration: 0.2,
        stagger: 0.02
      });
    }
  }, [isActive]);

  return (
    <div 
      ref={ref}
      className={`w-full h-screen flex flex-col justify-center ${isLast ? '' : 'mb-6'}`}
      style={{
        opacity: 1, // Always render but control visibility with CSS
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        visibility: isActive ? "visible" : "hidden",
        pointerEvents: isActive ? "all" : "none"
      }}
    >
      <div className="transform transition-all duration-300">
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
        
        <div ref={textContainerRef} className="space-y-1 mt-6">
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
    </div>
  );
});

Value.displayName = "Value";

export default Value;
