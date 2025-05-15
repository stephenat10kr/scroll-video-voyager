
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
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set up the flip animation for values when scrolling
  useEffect(() => {
    if (!values || values.length === 0 || !containerRef.current) return;

    // Clear any existing refs
    sectionRefs.current = [];

    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
      // Get all sections once refs are populated
      const sections = sectionRefs.current.filter(Boolean);
      if (sections.length === 0) return;
      
      console.log(`Found ${sections.length} value sections for animations`);
  
      // Make first value visible, hide others
      gsap.set(sections[0], { autoAlpha: 1 });
      gsap.set(sections.slice(1), { autoAlpha: 0 });
  
      // Create a timeline for the values animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${(sections.length - 1) * window.innerHeight}`, // One viewport height per transition
          pin: containerRef.current,
          anticipatePin: 1,
          scrub: 0.5, // Smoother scrubbing for better transitions
          invalidateOnRefresh: true,
          markers: true, // For debugging - remove in production
          onUpdate: (self) => {
            console.log(`ScrollTrigger progress: ${self.progress.toFixed(2)}`);
          }
        }
      });
  
      // Add animations for each section
      sections.forEach((section, i) => {
        if (i > 0) {
          // Set a position marker at every window height
          const position = `+=${i * 100}%`;
          console.log(`Setting animation for value ${i+1} at position ${position}`);
          
          // Hide the previous value
          tl.to(sections[i - 1], {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power1.in"
          }, position);
          
          // Show the current value
          tl.to(section, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power1.out"
          }, position);
        }
      });
    }, 100);
    
    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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

    console.log(`Rendering ${values.length} values in content()`);
    return (
      <div className="values-container h-screen" ref={containerRef}>
        {values.map((value, index) => {
          console.log(`Creating ref for value ${index+1}: ${value.valueTitle}`);
          return (
            <div 
              key={value.id} 
              className="value-section absolute top-0 left-0 h-full w-full flex items-center justify-center"
              ref={el => sectionRefs.current[index] = el}
              style={{ 
                visibility: index === 0 ? 'visible' : 'hidden',
                opacity: index === 0 ? 1 : 0
              }}
            >
              <Value valueTitle={value.valueTitle} valueText={value.valueText} isLast={index === values.length - 1} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className="values-wrapper w-full relative">
      <ChladniPattern>
        <div className="w-full mb-48 py-0">
          {content()}
        </div>
      </ChladniPattern>
    </div>
  );
};

export default Values;
