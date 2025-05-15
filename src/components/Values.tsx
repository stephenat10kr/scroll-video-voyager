
import React, { useRef, useEffect } from "react";
import Value1 from "./Value1";
import Value2 from "./Value2";
import Value3 from "./Value3";
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
  const value1Ref = useRef<HTMLDivElement>(null);
  const value2Ref = useRef<HTMLDivElement>(null);
  const value3Ref = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set up the scroll-triggered animations for values
  useEffect(() => {
    if (!values || values.length < 3 || !containerRef.current) return;
    
    // Sort values by orderNumber (should already be sorted by the hook)
    const sortedValues = [...values].sort((a, b) => a.orderNumber - b.orderNumber);
    const value1 = sortedValues[0];
    const value2 = sortedValues[1];
    const value3 = sortedValues[2];
    
    if (!value1 || !value2 || !value3) return;
    
    // Pin the container
    const pinTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=300vh", // 3 x 100vh for each value
      pin: true,
      pinSpacing: true,
    });
    
    // Make value1 visible initially, hide others
    gsap.set(value1Ref.current, { autoAlpha: 1 });
    gsap.set([value2Ref.current, value3Ref.current], { autoAlpha: 0 });
    
    // Create timeline for transitions
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300vh",
        scrub: 1,
        markers: false,
        invalidateOnRefresh: true,
      }
    });
    
    // Transition from value1 to value2 after 100vh
    tl.to(value1Ref.current, { autoAlpha: 0, duration: 0.3 }, "+=0.9");
    tl.to(value2Ref.current, { autoAlpha: 1, duration: 0.3 }, "-=0.1");
    
    // Transition from value2 to value3 after another 100vh
    tl.to(value2Ref.current, { autoAlpha: 0, duration: 0.3 }, "+=0.9");
    tl.to(value3Ref.current, { autoAlpha: 1, duration: 0.3 }, "-=0.1");
    
    return () => {
      // Clean up ScrollTrigger instances
      pinTrigger.kill();
      tl.scrollTrigger?.kill();
    };
  }, [values]);

  const content = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
            <div className="mb-24 animate-pulse">
              <div className="h-16 bg-gray-800 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      console.error("Error loading values:", error);
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
            <p className="body-text" style={{ color: colors.coral }}>
              Failed to load values
            </p>
          </div>
        </div>
      );
    }

    if (!values || values.length < 3) {
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
          <div className="col-span-12 md:col-span-12">
            <p className="body-text" style={{ color: colors.coral }}>
              Need at least 3 values in Contentful
            </p>
          </div>
        </div>
      );
    }

    // Sort values by orderNumber (should already be sorted by the hook)
    const sortedValues = [...values].sort((a, b) => a.orderNumber - b.orderNumber);
    const value1 = sortedValues[0];
    const value2 = sortedValues[1];
    const value3 = sortedValues[2];

    return (
      <div className="values-container h-screen" ref={containerRef}>
        <div className="value-section h-screen flex items-center justify-center w-full" ref={value1Ref}>
          <Value1 
            valueTitle={value1.valueTitle} 
            valueText={value1.valueText} 
          />
        </div>
        <div className="value-section h-screen flex items-center justify-center w-full" ref={value2Ref}>
          <Value2 
            valueTitle={value2.valueTitle} 
            valueText={value2.valueText} 
          />
        </div>
        <div className="value-section h-screen flex items-center justify-center w-full" ref={value3Ref}>
          <Value3 
            valueTitle={value3.valueTitle} 
            valueText={value3.valueText} 
            isLast={true}
          />
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
