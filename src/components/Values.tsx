
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

  // Set up the sticky behavior and color box transitions
  useEffect(() => {
    if (!containerRef.current) return;

    // Create ScrollTrigger for sticky behavior
    const stickyTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=300vh", // 3 sections of 100vh each
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    });

    // Get references to the color boxes
    const redBox = sectionRefs.current[0];
    const blueBox = sectionRefs.current[1];
    const greenBox = sectionRefs.current[2];

    if (!redBox || !blueBox || !greenBox) return;

    // Set initial state - show red box, hide others
    gsap.set(redBox, { autoAlpha: 1 });
    gsap.set([blueBox, greenBox], { autoAlpha: 0 });

    // Create a timeline for the color box transitions
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300vh", // 3 sections of 100vh each
        scrub: true,
        pin: true
      }
    });

    // Add animations for transitions between boxes
    // Transition from red to blue at 100vh
    tl.to(redBox, { autoAlpha: 0, duration: 0.5 }, "section1");
    tl.to(blueBox, { autoAlpha: 1, duration: 0.5 }, "section1");
    tl.addLabel("section1", "+=0.5");

    // Transition from blue to green at 200vh
    tl.to(blueBox, { autoAlpha: 0, duration: 0.5 }, "section2");
    tl.to(greenBox, { autoAlpha: 1, duration: 0.5 }, "section2");
    tl.addLabel("section2", "+=0.5");

    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      stickyTrigger.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill(true));
    };
  }, []);

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
    
    // Display color boxes instead of values
    return (
      <div className="color-boxes-container" ref={containerRef}>
        {/* Red Box */}
        <div 
          ref={el => sectionRefs.current[0] = el} 
          className="color-box h-screen w-full flex items-center justify-center"
          style={{ backgroundColor: '#ea384c', opacity: 0.5 }} 
        />
        
        {/* Blue Box */}
        <div 
          ref={el => sectionRefs.current[1] = el} 
          className="color-box h-screen w-full flex items-center justify-center"
          style={{ backgroundColor: '#1EAEDB', opacity: 0.5 }} 
        />
        
        {/* Green Box */}
        <div 
          ref={el => sectionRefs.current[2] = el} 
          className="color-box h-screen w-full flex items-center justify-center"
          style={{ backgroundColor: '#F2FCE2', opacity: 0.5 }} 
        />
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
