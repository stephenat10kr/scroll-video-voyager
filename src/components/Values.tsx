
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
  
  // Set up the scrolljacking for values
  useEffect(() => {
    if (!values || values.length === 0 || !containerRef.current) return;
    
    // Store any created ScrollTrigger instances for cleanup
    const scrollTriggers: ScrollTrigger[] = [];
    
    // Create a container to hold all value sections
    const valueContainer = containerRef.current;
    
    // Query for all value sections
    const sections = Array.from(valueContainer.querySelectorAll('.value-section'));
    
    if (sections.length === 0) return;
    
    // Set initial state - hide all values except the first one
    gsap.set(sections.slice(1), { autoAlpha: 0 });
    
    // Create a timeline for the values animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: valueContainer,
        pin: true,
        start: "top top",
        end: `+=${sections.length * window.innerHeight}`, // Each value takes up one full viewport height of scrolling
        scrub: 0.5, // Smoother scrubbing for better user experience
        anticipatePin: 1,
        markers: false, // Set to true for debugging
        id: "values-scrolljack",
        onUpdate: (self) => {
          // Optional: log progress for debugging
          // console.log("ScrollTrigger progress:", self.progress.toFixed(3));
        }
      }
    });
    
    scrollTriggers.push(ScrollTrigger.getById("values-scrolljack") as ScrollTrigger);
    
    // Add animations for each section with proper spacing
    sections.forEach((section, i) => {
      if (i > 0) {
        // First, hide the previous section
        tl.to(sections[i-1], { 
          autoAlpha: 0, 
          duration: 0.3,
          ease: "power1.inOut"
        }, `section${i}`);
        
        // Then show the current section
        tl.to(section, { 
          autoAlpha: 1, 
          duration: 0.3,
          ease: "power1.inOut" 
        }, `section${i}+=0.15`); // Slight overlap for smoother transition
      }
      
      // Add a label at the appropriate scroll position for the next section
      // Each section transition happens at equal intervals through the scroll range
      if (i < sections.length - 1) {
        tl.addLabel(`section${i+1}`, `+=${0.8/(sections.length-1)}`);
      }
    });
    
    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      scrollTriggers.forEach(trigger => {
        if (trigger) trigger.kill();
      });
    };
  }, [values]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
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
        </div>
      );
    }
    
    if (error) {
      console.error("Error loading values:", error);
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
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
        </div>
      );
    }
    
    if (!values || values.length === 0) {
      return (
        <div className="grid grid-cols-12 max-w-[90%] mx-auto">
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
        </div>
      );
    }
    
    // The main values display with proper structure for scrolljacking
    return (
      <div className="values-container h-screen" ref={containerRef}>
        {values.map((value, index) => (
          <div 
            key={value.id} 
            className="value-section absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ 
              visibility: index === 0 ? 'visible' : 'hidden', 
              opacity: index === 0 ? 1 : 0 
            }}
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
    <div className="values-wrapper w-full relative">
      <div className="max-w-[90%] mx-auto pb-8">
        <h2 className="title-sm" style={{
          color: colors.roseWhite
        }}>{title}</h2>
      </div>
      <ChladniPattern>
        {renderContent()}
      </ChladniPattern>
    </div>
  );
};

export default Values;
