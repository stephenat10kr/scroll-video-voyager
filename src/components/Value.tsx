
import React from "react";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
}

const Value: React.FC<ValueProps> = ({ valueTitle, valueText }) => {
  return (
    <div className="mb-24 last:mb-0">
      <h2 
        className="text-7xl font-gt-super leading-none mb-6 text-white"
      >
        {valueTitle}
      </h2>
      <div className="space-y-1">
        {valueText.map((text, index) => (
          <p key={index} className="text-white text-xl">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Value;
