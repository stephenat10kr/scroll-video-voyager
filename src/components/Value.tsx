
import React from "react";
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
  return <div className={`w-full h-screen flex flex-col justify-center bg-darkGreen ${isLast ? '' : 'mb-6'}`}>
      <h2 className="title-md text-coral mb-6 text-center py-[56px]">
        {valueTitle}
      </h2>
      <div className="space-y-1">
        {valueText.map((text, index) => <p key={index} className="title-sm text-coral text-center">
            {text}
          </p>)}
      </div>
    </div>;
};
export default Value;
