
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
      
      {/* Viewport-sized blue box with padding */}
      <div 
        className="bg-blue-500 flex items-center justify-center text-white font-bold text-lg"
        style={{ 
          position: "sticky",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: "calc(100vw - 4rem)", // Viewport width minus 2rem padding on each side
          height: "calc(100vh - 4rem)", // Viewport height minus 2rem padding on each side
          margin: "2rem" // Adding padding as margin around the box
        }}
      >
        Sticky Blue Box
      </div>
    </div>
  );
};

export default GreenBox;
