
import React, { useRef, useEffect } from "react";
import Value from "./Value";
import { useValues } from "@/hooks/useValues";
import ChladniPattern from "./ChladniPattern";
import colors from "@/lib/theme";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Values: React.FC = () => {
  const {
    data: values,
    isLoading,
    error
  } = useValues();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Set up the values section with fixed height to allow for scrolling through all sections
  useEffect(() => {
    if (!containerRef.current || !values || values.length === 0) return;
    
    // Set container height to allow for scrolling through all values
    // Each value takes 100vh of scroll space
    gsap.set(containerRef.current, {
      height: `${values.length * 100}vh`,
    });
    
    // Clean up function
    return () => {
      // Reset any gsap modifications
      if (containerRef.current) {
        gsap.set(containerRef.current, { clearProps: "all" });
      }
    };
  }, [values]);

  // Set up pin and animations for the values section
  useEffect(() => {
    if (!values || values.length === 0 || !containerRef.current || !wrapperRef.current) return;

    // Make all sections invisible except the first one
    sectionRefs.current.forEach((section, i) => {
      if (section) {
        gsap.set(section, {
          autoAlpha: i === 0 ? 1 : 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        });
      }
    });

    // Create the scroll trigger for the overall section
    const pinTrigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: `bottom bottom`,
      pin: true,
      anticipatePin: 1,
    });

    // Create a timeline for transitioning between values
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${values.length * 100}vh`, // Total scroll height
        scrub: 0.5, // Smooth scrubbing
        pin: false, // The section is already pinned above
      }
    });

    // Add animations for each transition between values
    values.forEach((_, i) => {
      if (i < values.length - 1) {
        // Calculate scroll position for this transition
        // Each value gets shown for 100vh of scroll
        const scrollPos = i + 1; 
        
        // Fade out current value
        tl.to(sectionRefs.current[i], {
          autoAlpha: 0,
          duration: 0.3,
        }, scrollPos);
        
        // Fade in next value
        tl.to(sectionRefs.current[i + 1], {
          autoAlpha: 1,
          duration: 0.3,
        }, scrollPos);
      }
    });

    // Clean up ScrollTrigger instances when component unmounts
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      tl.kill();
      pinTrigger.kill();
    };
  }, [values]);

  const content = () => {
    if (isLoading) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
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
          <div className="col-span-12 md:col-span-12">
            <p className="body-text" style={{
            color: colors.coral
          }}>Failed to load values</p>
          </div>
        </div>;
    }
    if (!values || values.length === 0) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
            <p className="body-text" style={{
            color: colors.coral
          }}>No values available</p>
          </div>
        </div>;
    }

    return (
      <div className="values-container h-screen relative" ref={containerRef}>
        {values.map((value, index) => (
          <div 
            key={value.id} 
            className="value-section h-screen w-full flex items-center justify-center"
            ref={el => sectionRefs.current[index] = el}
          >
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
    <div ref={wrapperRef} className="values-wrapper w-full h-screen overflow-hidden">
      <ChladniPattern>
        <div className="w-full mb-48 py-0">
          {content()}
        </div>
      </ChladniPattern>
    </div>
  );
};

export default Values;
