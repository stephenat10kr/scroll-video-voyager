
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
      className="w-full flex items-center justify-center relative"
      style={{ 
        backgroundColor,
        height: "300vh" // Fixed height of 300vh instead of min-height
      }}
    >
      <div className="max-w-[90%] mx-auto">
        {/* Content can be added here if needed */}
      </div>
      
      {/* Sticky blue box that doesn't scroll with the page */}
      <div 
        className="w-64 h-64 bg-blue-500 flex items-center justify-center text-white font-bold text-lg"
        style={{ 
          position: "sticky",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10
        }}
      >
        Sticky Blue Box
      </div>
    </div>
  );
};

export default GreenBox;
