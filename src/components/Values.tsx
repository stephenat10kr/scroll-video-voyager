
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

  // Set up sticky behavior and scroll animations
  useEffect(() => {
    if (!values || values.length < 3 || !containerRef.current) return;
    
    console.log("Setting up values animations with values:", values);
    
    // Create a timeline for the values animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%", // Make the scroll last for 3x the viewport height
        pin: true,
        anticipatePin: 1,
        scrub: true,
        markers: false
      }
    });

    // Get the DOM elements for each value
    const value1 = containerRef.current.querySelector('.value-1');
    const value2 = containerRef.current.querySelector('.value-2');
    const value3 = containerRef.current.querySelector('.value-3');

    if (!value1 || !value2 || !value3) {
      console.error("Could not find all value elements", { value1, value2, value3 });
      return;
    }

    // Hide value2 and value3 initially
    gsap.set([value2, value3], { autoAlpha: 0 });
    
    // First animation: value1 -> value2 at 33% of the scroll
    tl.to(value1, { autoAlpha: 0, duration: 0.3 }, "+=0.3");
    tl.to(value2, { autoAlpha: 1, duration: 0.3 }, "-=0.1");
    
    // Second animation: value2 -> value3 at 66% of the scroll
    tl.to(value2, { autoAlpha: 0, duration: 0.3 }, "+=0.3");
    tl.to(value3, { autoAlpha: 1, duration: 0.3 }, "-=0.1");

    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(true));
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
    if (!values || values.length < 3) {
      return <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
            <p className="body-text" style={{
            color: colors.coral
          }}>Not enough values available (need at least 3)</p>
          </div>
        </div>;
    }
    
    // Get the first 3 values for our animation sequence
    const value1 = values[0];
    const value2 = values[1];
    const value3 = values[2];
    
    return (
      <div className="values-container relative h-screen" ref={containerRef}>
        <div className="value-1 absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Value valueTitle={value1.valueTitle} valueText={value1.valueText} isLast={false} />
        </div>
        <div className="value-2 absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Value valueTitle={value2.valueTitle} valueText={value2.valueText} isLast={false} />
        </div>
        <div className="value-3 absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Value valueTitle={value3.valueTitle} valueText={value3.valueText} isLast={true} />
        </div>
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className="values-wrapper w-full">
      <ChladniPattern>
        <div className="w-full mb-48 py-0">
          {content()}
        </div>
      </ChladniPattern>
    </div>
  );
};

export default Values;
