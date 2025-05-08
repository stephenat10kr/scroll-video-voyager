
import React from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";

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

  if (isLoading) {
    return <div className="w-full bg-black py-24">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden xs:block sm:block md:block col-span-3">
            <h2 className="title-sm text-white">{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <div className="mb-24 animate-pulse">
              <div className="h-16 bg-gray-800 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>;
  }

  if (error) {
    console.error("Error loading values:", error);
    return <div className="w-full bg-black py-24">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden sm:block md:block col-span-3">
            <h2 className="title-sm text-white">{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="body-text text-white/70">Failed to load values</p>
          </div>
        </div>
      </div>;
  }

  if (!values || values.length === 0) {
    return <div className="w-full bg-black py-24">
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden sm:block md:block col-span-3">
            <h2 className="title-sm text-white">{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="body-text text-white/70">No values available</p>
          </div>
        </div>
      </div>;
  }

  return <div className="w-full py-24 bg-[#203435]">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div className="hidden sm:block col-span-3">
          <h2 className="title-sm text-white">{title}</h2>
        </div>
        <div className="col-span-12 sm:col-span-9">
          {values.map((value, index) => <Value key={value.id} valueTitle={value.valueTitle} valueText={value.valueText} isLast={index === values.length - 1} />)}
        </div>
      </div>
    </div>;
};

export default Values;
