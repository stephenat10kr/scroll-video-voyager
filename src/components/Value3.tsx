
import React from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";

interface Value3Props {
  valueTitle: string;
  valueText: string[];
  isLast?: boolean;
}

const Value3: React.FC<Value3Props> = ({
  valueTitle,
  valueText,
  isLast = false
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center px-4">
      <h2 className="title-md mb-6 text-center py-[56px]" style={{ color: colors.coral }}>
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center mb-8">
        <Spinner />
      </div>
      
      <div className="space-y-4 max-w-2xl mx-auto">
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

export default Value3;
