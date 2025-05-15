
// Register the ScrollTrigger plugin globally
import React, { useEffect, useRef } from "react";
import colors from "@/lib/theme";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin outside of component
gsap.registerPlugin(ScrollTrigger);

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if GSAP is loaded properly
    if (!gsap) {
      console.error("GSAP not loaded");
      return;
    }
    
    // Check if the reference is valid
    if (!boxRef.current) {
      console.error("Box reference not available");
      return;
    }
    
    console.log("Setting up ScrollTrigger for GreenBox");
    
    // Create the scroll trigger effect with improved settings
    const trigger = ScrollTrigger.create({
      trigger: boxRef.current,
      start: "top top", // When the top of the box reaches the top of the viewport
      end: "+=300vh", // Keep it pinned for 300vh worth of scrolling
      pin: true, // Pin the element in place
      pinSpacing: true, // Creates the scroll space needed
      markers: true, // Add markers for debugging (will remove in production)
      onEnter: () => console.log("GreenBox: ScrollTrigger entered"),
      onLeave: () => console.log("GreenBox: ScrollTrigger left"),
      onEnterBack: () => console.log("GreenBox: ScrollTrigger entered back"),
      onLeaveBack: () => console.log("GreenBox: ScrollTrigger left back")
    });
    
    // Log successful creation
    console.log("ScrollTrigger created:", trigger);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up ScrollTrigger");
      trigger.kill(); // Kill the ScrollTrigger instance when component unmounts
    };
  }, []);
  
  return (
    <div 
      ref={boxRef}
      className="w-full min-h-screen flex items-center justify-center relative z-10"
      style={{ backgroundColor }}
    >
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
    </div>
  );
};

export default GreenBox;
