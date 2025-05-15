
import React from "react";

const Values: React.FC = () => {
  return (
    <div className="w-full mb-48 py-0 bg-[#203435]">
      {/* Simple semi-transparent red box that takes up full screen height */}
      <div 
        className="h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(234, 56, 76, 0.7)' }} // Semi-transparent red using the same red color
      />
    </div>
  );
};

export default Values;
