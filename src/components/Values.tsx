
import React, { useRef, useEffect, useState } from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import ChladniPattern from "./ChladniPattern";
import colors from "@/lib/theme";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const valuesContainerRef = useRef<HTMLDivElement>(null);
  const [activeValueIndex, setActiveValueIndex] = useState<number | null>(null);
  const [isScrollSnapping, setIsScrollSnapping] = useState(false);
  const [hasCompletedAllValues, setHasCompletedAllValues] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up scroll snapping and intersection observers
  useEffect(() => {
    if (!values || values.length === 0 || isLoading) return;
    
    // Create refs array with the correct length
    valueRefs.current = Array(values.length).fill(null);
    
    // Clean up function to disconnect observers
    const cleanup = () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };

    // Flag to track if the values section has been viewed
    let hasEnteredValuesSection = false;
    let isLeavingSection = false;

    // Observer for the main values section to detect entry and exit
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasEnteredValuesSection) {
          hasEnteredValuesSection = true;
          setIsScrollSnapping(true);
          isLeavingSection = false;
          
          // Activate the first value
          setActiveValueIndex(0);
          
          // Scroll to the first value
          if (valueRefs.current[0]) {
            valueRefs.current[0].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        } else if (!entry.isIntersecting && hasEnteredValuesSection) {
          // When leaving the section entirely, disable snapping to allow normal scrolling
          isLeavingSection = true;
          
          // Short delay to ensure we're truly exiting the section
          setTimeout(() => {
            if (isLeavingSection) {
              setIsScrollSnapping(false);
            }
          }, 100);
        }
      });
    }, { threshold: 0.1 }); // Lower threshold to detect entering/leaving earlier

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }
    
    // Set up intersection observers after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      cleanup();
      
      // Create observers for each value
      values.forEach((_, index) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveValueIndex(index);
              
              // If it's the last value, mark as completed after viewing it
              if (index === values.length - 1) {
                const timer = setTimeout(() => {
                  setHasCompletedAllValues(true);
                  setIsScrollSnapping(false);
                }, 1500); // Time to view the last value before releasing the snap
                return () => clearTimeout(timer);
              }
            }
          });
        }, { 
          threshold: 0.7, // When at least 70% of the element is visible
          rootMargin: "-10% 0px" // Adds margin to trigger slightly before center
        });
        
        if (valueRefs.current[index]) {
          observer.observe(valueRefs.current[index]!);
          observersRef.current.push(observer);
        }
      });
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cleanup();
      sectionObserver.disconnect();
    };
  }, [values, isLoading]);

  // Apply scroll snapping CSS when needed
  useEffect(() => {
    if (!sectionRef.current || !valuesContainerRef.current) return;
    
    if (isScrollSnapping && !hasCompletedAllValues) {
      // Apply scroll-snapping styles to the VALUES CONTAINER only, not the whole document
      valuesContainerRef.current.style.scrollSnapType = 'y mandatory';
      
      // If we have an active value, scroll to it
      if (activeValueIndex !== null && valueRefs.current[activeValueIndex]) {
        valueRefs.current[activeValueIndex]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    } else {
      // Remove scroll-snapping styles
      if (valuesContainerRef.current) {
        valuesContainerRef.current.style.scrollSnapType = '';
      }
    }
  }, [isScrollSnapping, activeValueIndex, hasCompletedAllValues]);

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
        className="col-span-12 sm:col-span-9 flex flex-col items-center max-w-[90%] mx-auto"
      >
        {values.map((value, index) => (
          <div 
            key={value.id} 
            ref={el => valueRefs.current[index] = el} 
            className="w-full h-[80vh] flex items-center"
            style={{ scrollSnapAlign: 'center' }}
          >
            <Value 
              valueTitle={value.valueTitle} 
              valueText={value.valueText} 
              isActive={activeValueIndex === index}
              previousValue={index > 0 ? values[index - 1] : null}
              isLast={index === values.length - 1} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChladniPattern>
      <div ref={sectionRef} className="w-full py-24 mb-48 relative">
        <div className="max-w-[90%] mx-auto mb-16 text-left">
          <h2 className="title-sm" style={{color: colors.roseWhite}}>{title}</h2>
        </div>
        {content()}
      </div>
    </ChladniPattern>
  );
};

export default Values;
