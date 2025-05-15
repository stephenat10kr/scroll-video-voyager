
import React, { useState, useEffect, useRef } from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  const [currentValue, setCurrentValue] = useState("Value 1");
  const [isFlipping, setIsFlipping] = useState(false);
  const previousValue = useRef("Value 1");
  
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
        let newValue = "Value 1";
        
        if (scrollPercentage >= 60) {
          newValue = "Value 3";
        } else if (scrollPercentage >= 30) {
          newValue = "Value 2";
        } else {
          newValue = "Value 1";
        }
        
        // Only trigger animation if the value is actually changing
        if (newValue !== currentValue) {
          previousValue.current = currentValue;
          setIsFlipping(true);
          
          // Set the new value after a slight delay to allow the animation to start
          setTimeout(() => {
            setCurrentValue(newValue);
            // Reset the flipping state after the animation completes
            setTimeout(() => {
              setIsFlipping(false);
            }, 500); // Match this with the CSS animation duration
          }, 250);
        }
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentValue]);
  
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
        className="sticky top-0 w-full py-8 text-center flex justify-center items-center"
        style={{
          color: colors.darkGreen,
          zIndex: 10,
          height: "100vh"
        }}
      >
        <div className="flip-container" style={{ perspective: "1000px" }}>
          <div 
            className={`flip-box ${isFlipping ? 'flipping' : ''}`} 
            style={{
              position: "relative",
              width: "100%",
              height: "120px",
              transition: "transform 0.8s",
              transformStyle: "preserve-3d"
            }}
          >
            <div 
              className="flip-box-front title-lg"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isFlipping ? previousValue.current : currentValue}
            </div>
            <div 
              className="flip-box-back title-lg"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotateX(180deg)"
              }}
            >
              {currentValue}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
      
      <style>
        {`
          .flip-box.flipping {
            transform: rotateX(180deg);
          }
        `}
      </style>
    </div>
  );
};

export default GreenBox;
