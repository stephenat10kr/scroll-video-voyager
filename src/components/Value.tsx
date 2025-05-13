
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
  
  // Animation effect when value becomes active
  useEffect(() => {
    if (isActive && titleRef.current && textContainerRef.current) {
      // Clear any existing animations
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(textContainerRef.current.children);
      
      // Animate title from bottom to current position
      gsap.fromTo(
        titleRef.current, 
        { 
          y: 80, 
          opacity: 0 
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power3.out" 
        }
      );
      
      // Animate text paragraphs with staggered fade-in effect
      gsap.fromTo(
        textContainerRef.current.children,
        { 
          opacity: 0, 
          y: 30 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.15,
          delay: 0.3,
          ease: "power2.out"
        }
      );
    } else if (!isActive && titleRef.current && textContainerRef.current) {
      // Animate out when not active
      gsap.to(titleRef.current, { 
        opacity: 0, 
        y: -80, 
        duration: 0.5, 
        ease: "power2.in" 
      });
      
      gsap.to(textContainerRef.current.children, { 
        opacity: 0, 
        y: -30, 
        duration: 0.4, 
        stagger: 0.05,
        ease: "power2.in" 
      });
    }
  }, [isActive]);

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="relative">
        <h2 
          ref={titleRef} 
          className="title-md mb-6 text-center py-[56px]" 
          style={{ 
            color: colors.coral,
            opacity: 0 // Start invisible for animation
          }}
        >
          {valueTitle}
        </h2>
      </div>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center mb-8">
        <Spinner />
      </div>
      
      <div ref={textContainerRef} className="space-y-4">
        {valueText.map((text, index) => (
          <p 
            key={index} 
            className="title-sm text-center" 
            style={{ 
              color: colors.coral,
              opacity: 0 // Start invisible for animation
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Value;
