import React, { useRef, useState, useEffect } from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import colors from "@/lib/theme";
import { useScrollJack } from "@/hooks/scrollJack";
import ScrollIndicator from "./ScrollIndicator";

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
  // Create an array of refs for the value sections
  const valueRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isScrollJackActive, setIsScrollJackActive] = useState(false);
  const [isScrollJackComplete, setIsScrollJackComplete] = useState(false);

  // Reset refs when values data changes
  useEffect(() => {
    if (values && values.length > 0) {
      // Initialize array with proper React refs
      valueRefs.current = Array(values.length)
        .fill(null)
        .map(() => React.createRef<HTMLDivElement>());
    }
  }, [values]);

  // Use our scroll jack hook
  const { isActive, currentSectionIndex, completed } = useScrollJack({
    containerRef,
    sectionRefs: valueRefs.current,
    threshold: 0.1,
    onComplete: () => {
      console.log("Scroll jack completed");
      setIsScrollJackComplete(true);
    }
  });
  
  // Sync state from hook
  useEffect(() => {
    setCurrentSectionIndex(currentSectionIndex);
    setIsScrollJackActive(isActive);
    setIsScrollJackComplete(completed);
  }, [currentSectionIndex, isActive, completed]);

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
      <div className="w-full relative" style={{ minHeight: "100vh" }}>
        {/* Values content */}
        <div className="absolute inset-0 flex flex-col justify-center">
          {values.map((value, index) => (
            <Value
              key={value.id}
              ref={valueRefs.current[index]} 
              valueTitle={value.valueTitle}
              valueText={value.valueText}
              isActive={currentSectionIndex === index}
              isLast={index === values.length - 1}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator 
          currentSection={currentSectionIndex}
          totalSections={values.length}
          isActive={isScrollJackActive && !isScrollJackComplete}
        />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      id="values-container"
      className="w-full py-24 mb-48 relative z-10"
      style={{ 
        minHeight: "100vh"
      }}
      data-scrolljack-active={isScrollJackActive}
      data-current-section={currentSectionIndex}
      data-scrolljack-complete={isScrollJackComplete}
    >
      <div className="max-w-[90%] mx-auto mb-16 text-left">
        <h2 className="title-sm" style={{
        color: colors.roseWhite
      }}>{title}</h2>
      </div>
      {content()}
      
      {/* Scroll indicator for mobile */}
      {isScrollJackActive && !isScrollJackComplete && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
          <div className="animate-bounce mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5L12 19M12 19L5 12M12 19L19 12" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-xs" style={{ color: colors.coral }}>Scroll to continue</p>
        </div>
      )}
    </div>
  );
};

export default Values;
