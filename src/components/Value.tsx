
import React from "react";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
}

const Value: React.FC<ValueProps> = ({ valueTitle, valueText }) => {
  return (
    <div className="mb-24 last:mb-0">
      <h2 
        className="text-[92px] font-gt-super leading-none mb-6"
        style={{
          background: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent"
        }}
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
