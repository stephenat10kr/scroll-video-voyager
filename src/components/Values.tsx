
import React from "react";

const Values: React.FC = () => {
  return (
    <div className="w-full mb-48 py-0 bg-[#203435]">
      {/* Blue box with sticky positioning */}
      <div 
        className="h-screen w-full sticky top-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(33, 150, 243, 0.7)' }} // Semi-transparent blue
      />
    </div>
  );
};

export default Values;
