
import React from "react";
import ChladniPattern from "./ChladniPattern";

const Values: React.FC = () => {
  return (
    <ChladniPattern>
      <div className="w-full mb-48 py-0">
        {/* Simple semi-transparent red box that takes up full screen height */}
        <div 
          className="h-screen w-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(234, 56, 76, 0.7)' }} // Semi-transparent red using the same red color
        />
      </div>
    </ChladniPattern>
  );
};

export default Values;
