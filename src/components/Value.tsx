
import React from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
  isLast?: boolean;
}

const Value: React.FC<ValueProps> = ({
  valueTitle,
  valueText,
  isLast = false
}) => {
  return (
    <div className={`w-full h-screen flex flex-col justify-center ${isLast ? '' : 'mb-6'} bg-white/10 rounded-lg p-8 relative z-30`}>
      <h2 className="title-xl mb-6 text-center py-[56px]" style={{ color: colors.coral }}>
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center">
        <Spinner />
      </div>
      
      <div className="space-y-1">
        {valueText.map((text, index) => (
          <p 
            key={index} 
            className="title-sm text-center" 
            style={{ color: colors.coral }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Value;
