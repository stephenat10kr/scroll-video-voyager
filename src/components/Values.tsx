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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  
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
        pinSpacing: true,
        start: "top top",
        end: `+=${sections.length * 100}vh`, // Each value takes up one full viewport height of scrolling
        scrub: 0.5, // Smoother scrubbing
        anticipatePin: 1,
        fastScrollEnd: true, // Improve performance
        preventOverlaps: true, // Prevent overlapping animations
        onUpdate: (self) => {
          // Update scroll progress for pattern
          setScrollProgress(self.progress);
          
          // Update pattern position - keep it fixed during the scroll sequence
          if (patternRef.current && self.progress > 0 && self.progress < 1) {
            if (patternRef.current.style.position !== 'fixed') {
              gsap.set(patternRef.current, { 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100vh', 
                zIndex: 10 
              });
            }
          } else if (patternRef.current) {
            // Reset when outside of scroll sequence
            if (patternRef.current.style.position !== 'relative') {
              gsap.set(patternRef.current, { 
                position: 'relative', 
                top: 'auto', 
                left: 'auto',
                height: '100%',
                width: '100%', 
                zIndex: 'auto' 
              });
            }
          }
        },
        id: "values-scrolljack",
      }
    });
    
    scrollTriggers.push(ScrollTrigger.getById("values-scrolljack") as ScrollTrigger);
    
    // Add transitions for each section
    sections.forEach((section, i) => {
      if (i > 0) {
        // First fade out the previous section
        tl.to(sections[i-1], { 
          autoAlpha: 0, 
          duration: 0.3,
          ease: "power2.inOut"
        }, `section${i}`);
        
        // Then fade in the current section
        tl.to(section, { 
          autoAlpha: 1, 
          duration: 0.3,
          ease: "power2.inOut" 
        }, `section${i}+=0.15`); // Slight overlap for smoother transition
      }
      
      // Add a label for the next section transition
      if (i < sections.length - 1) {
        // This creates equal spacing between each section transition
        tl.addLabel(`section${i+1}`, `+=${1/(sections.length-1)}`);
      }
    });
    
    // Force a refresh of ScrollTrigger
    ScrollTrigger.refresh(true);
    
    // Update on resize to maintain correct layout
    const handleResize = () => {
      setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Clean up ScrollTrigger instances
      scrollTriggers.forEach(trigger => {
        if (trigger) trigger.kill();
      });
      
      // Clean up resize listener
      window.removeEventListener('resize', handleResize);
      
      // Reset any GSAP styles
      if (patternRef.current) {
        gsap.set(patternRef.current, { clearProps: "all" });
      }
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
            ref={el => sectionRefs.current[index] = el}
            className="value-section absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ 
              visibility: index === 0 ? 'visible' : 'hidden', 
              opacity: index === 0 ? 1 : 0,
              zIndex: 20 // Ensure content is above the pattern
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
    <div className="values-wrapper w-full relative overflow-hidden">
      <div className="max-w-[90%] mx-auto pb-8">
        <h2 className="title-sm" style={{
          color: colors.roseWhite
        }}>{title}</h2>
      </div>
      <div ref={patternRef} className="w-full h-full">
        <ChladniPattern scrollProgress={scrollProgress}>
          {renderContent()}
        </ChladniPattern>
      </div>
    </div>
  );
};

export default Values;
