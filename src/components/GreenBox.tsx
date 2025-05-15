
import React from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  return (
    <div 
      className="w-full relative flex flex-col justify-center"
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
        Value 1
      </div>
      
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
    </div>
  );
};

export default GreenBox;
