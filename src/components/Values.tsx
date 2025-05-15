
import React from "react";

const Values: React.FC = () => {
  return (
    <div className="w-full mb-48 py-0 bg-[#203435]">
      {/* Semi-transparent red box with sticky positioning */}
      <div 
        className="h-screen w-full sticky top-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(234, 56, 76, 0.7)' }} // Semi-transparent red using the same red color
      />
    </div>
  );
};

export default Values;
