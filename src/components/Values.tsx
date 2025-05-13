
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
  const [isScrollJackingActive, setIsScrollJackingActive] = useState(false);
  const [hasCompletedAllValues, setHasCompletedAllValues] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Set up scroll jacking and intersection observers
  useEffect(() => {
    if (!values || values.length === 0 || isLoading || !sectionRef.current) return;
    
    // Create refs array with the correct length
    valueRefs.current = Array(values.length).fill(null);
    
    // Clean up function to disconnect observers
    const cleanup = () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
      
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };

    // Set up the scroll trigger for the values section
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 20%",
      end: "bottom 80%",
      onEnter: () => {
        setIsScrollJackingActive(true);
        setActiveValueIndex(0);
        document.body.style.overflow = "hidden";
      },
      onLeaveBack: () => {
        setIsScrollJackingActive(false);
        document.body.style.overflow = "";
      },
      onLeave: () => {
        if (hasCompletedAllValues) {
          setIsScrollJackingActive(false);
          document.body.style.overflow = "";
        }
      }
    });
    
    scrollTriggerRef.current = scrollTrigger;
    
    // Handle wheel events for custom scrolling
    const handleWheel = (e: WheelEvent) => {
      if (!isScrollJackingActive || hasCompletedAllValues) return;
      
      e.preventDefault();
      
      const delta = e.deltaY;
      
      if (delta > 0 && activeValueIndex !== null && activeValueIndex < values.length - 1) {
        // Scroll down - next value
        setActiveValueIndex(activeValueIndex + 1);
      } else if (delta < 0 && activeValueIndex !== null && activeValueIndex > 0) {
        // Scroll up - previous value
        setActiveValueIndex(activeValueIndex - 1);
      } else if (delta > 0 && activeValueIndex === values.length - 1) {
        // Reached the last value - release scroll jacking
        setHasCompletedAllValues(true);
        document.body.style.overflow = "";
        setIsScrollJackingActive(false);
        
        // Allow the next wheel event to work normally
        setTimeout(() => {
          window.scrollBy(0, 100); // Small scroll to indicate to the user that normal scrolling has resumed
        }, 10);
      }
    };
    
    // Add wheel event listener when scroll jacking is active
    if (isScrollJackingActive && !hasCompletedAllValues) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      cleanup();
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = "";
    };
  }, [values, isLoading, isScrollJackingActive, activeValueIndex, hasCompletedAllValues]);

  // Effect for transitions between values
  useEffect(() => {
    if (activeValueIndex === null || !values || !valueRefs.current[activeValueIndex]) return;
    
    // If we've reached the last value, mark as completed after a delay
    if (activeValueIndex === values.length - 1) {
      const timer = setTimeout(() => {
        setHasCompletedAllValues(true);
        setIsScrollJackingActive(false);
        document.body.style.overflow = "";
      }, 2000); // Time to view the last value before releasing the scroll jacking
      
      return () => clearTimeout(timer);
    }
  }, [activeValueIndex, values]);

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
        <div className="relative w-full h-screen flex items-center justify-center">
          {values.map((value, index) => (
            <div 
              key={value.id} 
              ref={el => valueRefs.current[index] = el} 
              className="absolute w-full"
              style={{ 
                opacity: activeValueIndex === index ? 1 : 0,
                pointerEvents: activeValueIndex === index ? 'auto' : 'none',
                transition: 'opacity 0.4s ease-in-out'
              }}
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
      </div>
    );
  };

  return (
    <div 
      ref={sectionRef} 
      className="w-full relative"
      style={{ 
        height: isScrollJackingActive && !hasCompletedAllValues ? "100vh" : "auto",
        minHeight: "100vh"
      }}
    >
      <ChladniPattern>
        <div className="py-24 mb-48">
          <div className="max-w-[90%] mx-auto mb-16 text-left">
            <h2 className="title-sm" style={{color: colors.roseWhite}}>{title}</h2>
          </div>
          {content()}
        </div>
      </ChladniPattern>
    </div>
  );
};

export default Values;
