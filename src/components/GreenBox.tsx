
import React, { useRef, useEffect } from "react";
import colors from "@/lib/theme";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    
    // Create a ScrollTrigger instance that pins the element for 300vh
    const scrollTrigger = ScrollTrigger.create({
      trigger: box,
      start: "top top", // When the top of the box reaches the top of the viewport
      end: "+=300vh", // Pin for 300vh of scrolling
      pin: true, // Pin the element in place
      pinSpacing: true, // Keep the space in the document flow
      markers: false, // Set to true for debugging
    });
    
    // Clean up when component unmounts
    return () => {
      scrollTrigger.kill();
    };
  }, []);
  
  return (
    <div 
      ref={boxRef}
      className="w-full min-h-screen flex items-center justify-center"
      style={{ backgroundColor }}
    >
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
    </div>
  );
};

export default GreenBox;
