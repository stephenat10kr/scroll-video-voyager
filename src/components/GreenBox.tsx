
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
        
        // Update text based on scroll percentage
        if (scrollPercentage >= 60) {
          setCurrentValue("Value 3");
        } else if (scrollPercentage >= 30) {
          setCurrentValue("Value 2");
        } else {
          setCurrentValue("Value 1");
        }
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return (
    <div 
      className="green-box w-full relative flex flex-col"
      style={{ 
        backgroundColor,
        height: "300vh" // Fixed height of 300vh
      }}
    >
      {/* Sticky text at the top */}
      <div 
        className="sticky top-0 w-full py-8 text-center title-lg"
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
