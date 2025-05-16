
import React from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import colors from "@/lib/theme";
interface ValuesProps {
  title: string;
}
const Values: React.FC<ValuesProps> = ({
  title
}) => {
  const {
    data: values,
    isLoading,
    error
  } = useValues();
  const content = () => {
    if (isLoading) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto bg-transparent">
          <div className="hidden xs:block sm:block md:block col-span-3 bg-transparent">
            <h2 className="title-sm bg-transparent" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9 bg-transparent">
            <div className="mb-24 animate-pulse bg-transparent">
              <div className="h-16 bg-gray-800/50 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-800/50 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800/50 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
            </div>
          </div>
        </div>;
    }
    if (error) {
      console.error("Error loading values:", error);
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto bg-transparent">
          <div className="hidden sm:block md:block col-span-3 bg-transparent">
            <h2 className="title-sm bg-transparent" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9 bg-transparent">
            <p className="body-text bg-transparent" style={{
            color: colors.coral
          }}>Failed to load values</p>
          </div>
        </div>;
    }
    if (!values || values.length === 0) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto bg-transparent">
          <div className="hidden sm:block md:block col-span-3 bg-transparent">
            <h2 className="title-sm bg-transparent" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9 bg-transparent">
            <p className="body-text bg-transparent" style={{
            color: colors.coral
          }}>No values available</p>
          </div>
        </div>;
    }
    return <div className="col-span-12 sm:col-span-9 flex flex-col items-center max-w-[90%] mx-auto bg-transparent">
        {values.map((value, index) => <Value key={value.id} valueTitle={value.valueTitle} valueText={value.valueText} isLast={index === values.length - 1} />)}
      </div>;
  };
  return (
    <div className="w-full py-24 mb-48 bg-transparent">
      <div className="max-w-[90%] mx-auto mb-16 text-left bg-transparent">
        <h2 className="title-sm bg-transparent" style={{
          color: colors.roseWhite
        }}>{title}</h2>
      </div>
      {content()}
    </div>
  );
};
export default Values;
