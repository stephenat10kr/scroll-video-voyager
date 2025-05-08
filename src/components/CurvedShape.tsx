
import React from "react";

interface CurvedShapeProps {
  className?: string;
  fill?: string;
}

const CurvedShape: React.FC<CurvedShapeProps> = ({ 
  className = "", 
  fill = "#203435"  // Default to the background color of the page
}) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg 
        width="100%" 
        height="210" 
        viewBox="0 0 1440 210" 
        preserveAspectRatio="none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M312.58 89.2563C150.65 54.8844 0 75.5117 0 0V210H1440V0H1439.64C1439.64 75.5117 1288.99 54.8844 1127.06 89.2563C919.9 133.222 898.46 194.76 719.82 194.76C541.18 194.76 519.75 133.222 312.58 89.2563Z" 
          fill={fill}
        />
      </svg>
    </div>
  );
};

export default CurvedShape;
