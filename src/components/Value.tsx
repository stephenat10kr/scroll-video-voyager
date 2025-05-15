
import React from "react";
import colors from "@/lib/theme";

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
    <div className={`w-full min-h-screen flex flex-col justify-center ${isLast ? '' : 'mb-6'}`}>
      <h2 className="title-xl mb-12 text-center py-[56px]" style={{ color: colors.coral }}>
        {valueTitle}
      </h2>
      
      <div className="space-y-2">
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
