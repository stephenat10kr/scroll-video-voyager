
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
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set up sticky behavior for the values section
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Create ScrollTrigger for sticky behavior
    const stickyTrigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: true,
      pinSpacing: false
    });
    
    return () => {
      stickyTrigger.kill();
    };
  }, []);

  // Set up the scrolljacking for values
  useEffect(() => {
    if (!values || values.length === 0 || !containerRef.current) return;
    
    const sections = [section1Ref.current, section2Ref.current, section3Ref.current].filter(Boolean);
    if (sections.length === 0) return;

    // Set initial state - show first value, hide others
    gsap.set(section1Ref.current, { autoAlpha: 1 });
    gsap.set([section2Ref.current, section3Ref.current], { autoAlpha: 0 });

    // Create a timeline for the values animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300vh", // 3 sections * 100vh each
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    // Transition from Value1 to Value2
    tl.to(section1Ref.current, {
      autoAlpha: 0,
      duration: 0.5
    }, "section1");
    
    tl.to(section2Ref.current, {
      autoAlpha: 1,
      duration: 0.5
    }, "section1");
    
    // Add a delay between transitions
    tl.addLabel("section2", "+=0.5");
    
    // Transition from Value2 to Value3
    tl.to(section2Ref.current, {
      autoAlpha: 0,
      duration: 0.5
    }, "section2");
    
    tl.to(section3Ref.current, {
      autoAlpha: 1,
      duration: 0.5
    }, "section2");

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
          }}>Need at least 3 values in Contentful</p>
          </div>
        </div>;
    }

    // Sort values by orderNumber
    const sortedValues = [...values].sort((a, b) => a.orderNumber - b.orderNumber);
    
    // Get the first 3 values
    const value1 = sortedValues[0];
    const value2 = sortedValues[1];
    const value3 = sortedValues[2];

    return (
      <div className="values-container" ref={containerRef}>
        <div ref={section1Ref} className="value-section h-screen flex items-center justify-center w-full">
          <Value1 valueTitle={value1.valueTitle} valueText={value1.valueText} />
        </div>
        <div ref={section2Ref} className="value-section h-screen flex items-center justify-center w-full">
          <Value2 valueTitle={value2.valueTitle} valueText={value2.valueText} />
        </div>
        <div ref={section3Ref} className="value-section h-screen flex items-center justify-center w-full">
          <Value3 valueTitle={value3.valueTitle} valueText={value3.valueText} />
        </div>
      </div>
    );
  };

  return <div ref={wrapperRef} className="values-wrapper w-full">
      <ChladniPattern>
        <div className="w-full mb-48 py-0">
          {content()}
        </div>
      </ChladniPattern>
    </div>;
};

export default Values;
