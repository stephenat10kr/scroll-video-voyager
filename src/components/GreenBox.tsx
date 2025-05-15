
import React from "react";
import colors from "@/lib/theme";

interface GreenBoxProps {
  backgroundColor?: string;
}

const GreenBox: React.FC<GreenBoxProps> = ({ 
  backgroundColor = "#F2FCE2" // Light green default
}) => {
  return (
    <div 
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
