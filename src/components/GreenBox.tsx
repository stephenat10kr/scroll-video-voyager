
import React, { useState, useEffect, useRef } from "react";
import colors from "@/lib/theme";
import { gsap } from "gsap";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  const [currentValue, setCurrentValue] = useState("Value 1");
  const textContainerRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<string>("Value 1");
  
  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = () => {
      // Get the GreenBox element
      const greenBox = document.querySelector(".green-box");
      
      if (greenBox) {
        // Get the bounding rectangle of the green box
        const rect = greenBox.getBoundingClientRect();
        // Calculate the box's total height
        const boxHeight = rect.height;
        // Calculate how much of the box has been scrolled
        const scrolledHeight = -rect.top;
        // Calculate the percentage of the box that has been scrolled
        const scrollPercentage = (scrolledHeight / boxHeight) * 100;
        
        // Update text based on scroll percentage with animation
        let newValue = "Value 1";
        if (scrollPercentage >= 60) {
          newValue = "Value 3";
        } else if (scrollPercentage >= 30) {
          newValue = "Value 2";
        }
        
        if (newValue !== currentValue) {
          animateTextChange(newValue);
        }
      }
    };

    // Animation function to flip the text
    const animateTextChange = (newValue: string) => {
      if (!textContainerRef.current) return;
      
      // Store the previous value for animation reference
      prevValueRef.current = currentValue;
      
      // Create a timeline for the flip animation
      const tl = gsap.timeline();
      
      // Animate out (flip up)
      tl.to(textContainerRef.current, {
        rotationX: 90,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          // Update the text at the halfway point
          setCurrentValue(newValue);
          
          // Animate in (flip down)
          gsap.to(textContainerRef.current, {
            rotationX: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentValue]); // Added currentValue as dependency
  
  return (
    <div 
      className="green-box w-full relative flex flex-col"
      style={{ 
        backgroundColor,
        height: "300vh" // Fixed height of 300vh
      }}
    >
      {/* Sticky text at the top with 3D perspective container */}
      <div
        className="sticky top-0 w-full py-8 flex justify-center perspective-[1000px]"
        style={{
          zIndex: 10,
          perspective: "1000px" // Add 3D perspective
        }}
      >
        <div
          ref={textContainerRef}
          className="title-lg text-center w-full transform-gpu"
          style={{
            color: colors.darkGreen,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
        >
          {currentValue}
        </div>
      </div>
      
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
    </div>
  );
};

export default GreenBox;
