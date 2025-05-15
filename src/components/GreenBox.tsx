
import React from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  return (
    <div className="relative w-full" style={{ height: "300vh" }}>
      <div 
        className="w-full min-h-screen flex items-center justify-center sticky top-0"
        style={{ 
          backgroundColor,
          zIndex: 10 // Higher z-index to ensure it appears above other elements during sticky positioning
        }}
      >
        <div className="max-w-[90%] mx-auto">
          {/* Content can be added here if needed */}
        </div>
      </div>
    </div>
  );
};

export default GreenBox;
