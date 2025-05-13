
import React, { useRef, useState, useEffect } from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import ChladniPattern from "./ChladniPattern";
import colors from "@/lib/theme";
import { useScrollJack } from "@/hooks/useScrollJack";

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
  
  // Create refs for the scroll-jacking functionality
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isScrollJackComplete, setIsScrollJackComplete] = useState(false);

  // Reset refs when values data changes
  useEffect(() => {
    if (values && values.length > 0) {
      valueRefs.current = Array(values.length).fill(null);
    }
  }, [values]);

  // Use our scroll jack hook
  const { isActive, currentSectionIndex, completed } = useScrollJack({
    containerRef,
    sectionRefs: valueRefs.current.filter(Boolean) as React.RefObject<HTMLElement>[],
    onComplete: () => setIsScrollJackComplete(true)
  });

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
      <div className="col-span-12 sm:col-span-9 max-w-[90%] mx-auto relative" style={{ height: "100vh" }}>
        {/* Progress indicator */}
        {isActive && (
          <div className="fixed top-1/2 right-6 z-20 flex flex-col items-center space-y-2">
            {values.map((_, index) => (
              <div 
                key={index}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: currentSectionIndex === index ? colors.coral : colors.roseWhite,
                  transform: currentSectionIndex === index ? 'scale(1.5)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Values content */}
        {values.map((value, index) => (
          <Value
            key={value.id}
            ref={el => valueRefs.current[index] = el}
            valueTitle={value.valueTitle}
            valueText={value.valueText}
            isActive={currentSectionIndex === index}
            isLast={index === values.length - 1}
          />
        ))}
      </div>
    );
  };

  return (
    <ChladniPattern>
      <div 
        ref={containerRef} 
        className="w-full py-24 mb-48 relative"
        style={{ 
          overflow: isActive && !isScrollJackComplete ? 'hidden' : 'visible' 
        }}
      >
        <div className="max-w-[90%] mx-auto mb-16 text-left">
          <h2 className="title-sm" style={{
          color: colors.roseWhite
        }}>{title}</h2>
        </div>
        {content()}
        
        {/* Scroll indicator */}
        {isActive && !completed && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
            <div className="animate-bounce mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L12 19M12 19L5 12M12 19L19 12" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-xs text-coral">Scroll to continue</p>
          </div>
        )}
      </div>
    </ChladniPattern>
  );
};

export default Values;
