
import React, { useRef, useEffect } from "react";
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  
  // Set up the sticky scrolling for exactly 300vh
  useEffect(() => {
    if (!values || values.length === 0 || !containerRef.current || !stickyWrapperRef.current) return;
    
    // Clear any existing refs
    sectionRefs.current = [];
    
    // Create ScrollTrigger for the sticky container - exactly 300vh
    const stickyTrigger = ScrollTrigger.create({
      trigger: stickyWrapperRef.current,
      start: "top top",
      end: "bottom top+=300vh", // Pin for exactly 300vh
      pin: true,
      pinSpacing: true,
    });
    
    // Create a timeline for the values animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300vh", // Fixed 300vh scroll distance regardless of number of values
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });
    
    // Get sections and set initial state
    const sections = sectionRefs.current.filter(Boolean);
    
    if (sections.length === 0) return;
    
    // Hide all values except the first one
    gsap.set(sections.slice(1), { autoAlpha: 0 });
    
    // Limit to only the first 3 values, if there are more than 3
    const visibleSections = sections.slice(0, 3);
    
    // Handle case where there's only 1 or 2 values
    if (visibleSections.length === 1) {
      // If only one value, show it for the whole 300vh scroll
      // No animation needed as it's already visible
    } else if (visibleSections.length === 2) {
      // If two values, split the 300vh into two 150vh sections
      tl.to(visibleSections[0], { autoAlpha: 0, duration: 0.5 }, "150vh");
      tl.to(visibleSections[1], { autoAlpha: 1, duration: 0.5 }, "150vh");
    } else {
      // If three or more values, show each for 100vh
      
      // Value 1 is shown from 0-100vh (already visible)
      
      // Transition to Value 2 at 100vh
      tl.to(visibleSections[0], { autoAlpha: 0, duration: 0.5 }, "100vh");
      tl.to(visibleSections[1], { autoAlpha: 1, duration: 0.5 }, "100vh");
      
      // Transition to Value 3 at 200vh
      tl.to(visibleSections[1], { autoAlpha: 0, duration: 0.5 }, "200vh");
      tl.to(visibleSections[2], { autoAlpha: 1, duration: 0.5 }, "200vh");
    }
    
    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      stickyTrigger.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(true));
    };
  }, [values]);
  
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
      <div className="values-container" ref={containerRef}>
        {values.slice(0, 3).map((value, index) => (
          <div 
            key={value.id} 
            className="value-section h-screen flex items-center justify-center w-full" 
            ref={el => sectionRefs.current[index] = el}
          >
            <Value 
              valueTitle={value.valueTitle} 
              valueText={value.valueText} 
              isLast={index === Math.min(values.length - 1, 2)} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={stickyWrapperRef} className="w-full">
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
    </div>
  );
};

export default Values;
