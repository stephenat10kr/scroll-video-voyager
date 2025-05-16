
import React, { useRef, useEffect } from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";
import ChladniPattern from "./ChladniPattern";

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
    <div className={`w-full h-screen flex flex-col justify-center ${isLast ? '' : 'mb-6'} relative z-30`}>
      <ChladniPattern>
        <div className="backdrop-blur-sm bg-white/5 rounded-lg p-8">
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
      </ChladniPattern>
    </div>
  );
};

export default Value;
