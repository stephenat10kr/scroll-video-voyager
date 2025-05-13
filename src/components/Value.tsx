
import React, { useEffect, useRef } from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";
import { gsap } from "gsap";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
  isActive?: boolean;
  previousValue?: {
    valueTitle: string;
    valueText: string[];
  } | null;
  isLast?: boolean;
}

const Value: React.FC<ValueProps> = ({
  valueTitle,
  valueText,
  isActive = false,
  previousValue = null,
  isLast = false
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const prevTitleRef = useRef<string | null>(null);
  const prevTextRef = useRef<string[] | null>(null);
  
  // Store the previous values when they change
  useEffect(() => {
    if (isActive && previousValue) {
      prevTitleRef.current = previousValue.valueTitle;
      prevTextRef.current = previousValue.valueText;
    }
  }, [isActive, previousValue]);

  // Animation effect when value becomes active
  useEffect(() => {
    if (isActive && titleRef.current && textContainerRef.current) {
      // Clear any existing animations
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(textContainerRef.current.children);
      
      // If we have a previous value, animate from it to the current value
      if (prevTitleRef.current) {
        // Create a temporary hidden element for the previous title
        const tempTitle = document.createElement('h2');
        tempTitle.className = titleRef.current.className;
        tempTitle.textContent = prevTitleRef.current;
        tempTitle.style.position = 'absolute';
        tempTitle.style.top = '0';
        tempTitle.style.color = colors.coral;
        titleRef.current.parentNode?.appendChild(tempTitle);
        
        // Animate the previous title out and the new one in
        gsap.fromTo(
          tempTitle, 
          { y: 0, opacity: 1 },
          { y: -50, opacity: 0, duration: 0.6, ease: "power2.inOut" }
        );
        
        gsap.fromTo(
          titleRef.current, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.inOut" }
        );
        
        // Remove temporary element after animation
        setTimeout(() => {
          tempTitle.remove();
        }, 700);
      } else {
        // Just fade in if no previous value
        gsap.fromTo(
          titleRef.current, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
      }
      
      // Animate text paragraphs
      gsap.fromTo(
        textContainerRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1,
          delay: 0.4,
          ease: "power2.out"
        }
      );
    }
  }, [isActive]);

  return (
    <div className="w-full flex flex-col justify-center">
      <h2 
        ref={titleRef} 
        className="title-md mb-6 text-center py-[56px]" 
        style={{ color: colors.coral }}
      >
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center">
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
};

export default Value;
