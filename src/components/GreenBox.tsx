
import React, { useState, useEffect } from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  const [currentValue, setCurrentValue] = useState("Value 1");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const vh = window.innerHeight;
      
      // Determine which value to show based on scroll position
      if (scrollPosition < vh) {
        setCurrentValue("Value 1");
      } else if (scrollPosition < vh * 2) {
        setCurrentValue("Value 2");
      } else {
        setCurrentValue("Value 3");
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Initial call to set the correct value based on current scroll position
    handleScroll();
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div 
      className="w-full relative flex flex-col"
      style={{ 
        backgroundColor,
        height: "300vh" // Fixed height of 300vh instead of min-height
      }}
    >
      {/* Sticky text at the top */}
      <div 
        className="sticky top-0 w-full py-8 text-center text-2xl font-bold"
        style={{
          color: colors.darkGreen,
          zIndex: 10
        }}
      >
        {currentValue}
      </div>
      
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
    </div>
  );
};

export default GreenBox;
