
import React from "react";
import { Separator } from "./ui/separator";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
  isLast?: boolean;
}

const Value: React.FC<ValueProps> = ({ valueTitle, valueText, isLast = false }) => {
  return (
    <div className={`${isLast ? '' : 'mb-6'}`}>
      <h2 
        className="text-7xl font-gt-super leading-none mb-6 text-white"
      >
        {valueTitle}
      </h2>
      <div className="space-y-1">
        {valueText.map((text, index) => (
          <p key={index} className="text-white text-sm">
            {text}
          </p>
        ))}
      </div>
      
      {!isLast && (
        <Separator className="bg-white h-px mt-24 mb-24" />
      )}
    </div>
  );
};

export default Value;
