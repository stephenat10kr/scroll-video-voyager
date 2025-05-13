import React, { useRef, useEffect } from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import ChladniPattern from "./ChladniPattern";
import colors from "@/lib/theme";

interface ValuesProps {
  title: string;
}

const Values: React.FC<ValuesProps> = ({
  title
}) => {
  const valuesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    data: values,
    isLoading,
    error
  } = useValues();

  // Setup scroll snapping
  useEffect(() => {
    const container = valuesContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Don't interfere with normal scrolling if we're not in the values container
      const rect = container.getBoundingClientRect();
      const isInViewport = (
        rect.top <= 0 &&
        rect.bottom >= 0
      );
      
      if (!isInViewport) return;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const content = () => {
    if (isLoading) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden xs:block sm:block md:block col-span-3">
            <h2 className="title-sm" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <div className="mb-24 animate-pulse">
              <div className="h-16 bg-gray-800 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>;
    }
    if (error) {
      console.error("Error loading values:", error);
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden sm:block md:block col-span-3">
            <h2 className="title-sm" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="body-text" style={{
            color: colors.coral
          }}>Failed to load values</p>
          </div>
        </div>;
    }
    if (!values || values.length === 0) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="hidden sm:block md:block col-span-3">
            <h2 className="title-sm" style={{
            color: colors.roseWhite
          }}>{title}</h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="body-text" style={{
            color: colors.coral
          }}>No values available</p>
          </div>
        </div>;
    }
    return (
      <div 
        ref={valuesContainerRef} 
        className="col-span-12 sm:col-span-9 flex flex-col items-center max-w-[90%] mx-auto snap-y snap-mandatory overflow-y-scroll h-screen"
      >
        {values.map((value, index) => (
          <div key={value.id} className="snap-start snap-always w-full h-screen">
            <Value 
              valueTitle={value.valueTitle} 
              valueText={value.valueText} 
              isLast={index === values.length - 1} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChladniPattern>
      <div className="w-full py-24 mb-48">
        <div className="max-w-[90%] mx-auto mb-16 text-left">
          <h2 className="title-sm" style={{
            color: colors.roseWhite
          }}>{title}</h2>
        </div>
        {content()}
      </div>
    </ChladniPattern>
  );
};

export default Values;
