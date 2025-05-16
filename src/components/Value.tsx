
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
    <div className={`w-full h-screen flex flex-col justify-center bg-transparent ${isLast ? '' : 'mb-6'}`}>
      <h2 className="title-xl mb-6 text-center py-[56px] bg-transparent" style={{ color: colors.coral }}>
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center bg-transparent">
        <Spinner />
      </div>
      
      <div className="space-y-1 bg-transparent">
        {valueText.map((text, index) => (
          <p 
            key={index} 
            className="title-sm text-center bg-transparent" 
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
