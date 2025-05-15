
import React from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#90EE90" // Light green color as requested
}) => {
  return (
    <div className="relative w-full" style={{ height: "300vh" }}> {/* Wrapper div with enough height for scrolling */}
      <div 
        className="w-full sticky top-0 z-10" /* Sticky positioning with z-index to stay on top */
        style={{ 
          backgroundColor,
          height: "100vh" /* Full viewport height */
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
