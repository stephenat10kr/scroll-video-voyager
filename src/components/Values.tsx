
import React, { useEffect } from "react";
import ChladniPattern from "./ChladniPattern";

const Values: React.FC = () => {
  useEffect(() => {
    // Original scroll position before locking
    let originalScrollPosition = 0;
    // Total height to lock (300vh)
    const lockHeight = window.innerHeight * 3;
    // Element to track
    let valueElement: HTMLDivElement | null = null;
    // Track if scrolling is currently locked
    let isLocked = false;
    // The total scrolled distance while locked
    let scrolledWhileLocked = 0;

    const handleScroll = () => {
      if (!valueElement) {
        valueElement = document.getElementById('values-section') as HTMLDivElement;
        if (!valueElement) return;
      }

      const rect = valueElement.getBoundingClientRect();
      
      // Check if the top of the element has reached the top of the viewport
      if (rect.top <= 0 && !isLocked) {
        // Lock scrolling by saving position and preventing default scroll
        isLocked = true;
        originalScrollPosition = window.scrollY;
        scrolledWhileLocked = 0;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${originalScrollPosition}px`;
        document.body.style.width = '100%';
      }
      
      // If locked, track wheel events to measure scroll intent
      if (isLocked) {
        window.addEventListener('wheel', handleWheel);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isLocked) return;
      
      // Track the amount scrolled
      scrolledWhileLocked += e.deltaY;
      
      // If scrolled more than the lock height, unlock
      if (scrolledWhileLocked > lockHeight) {
        isLocked = false;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Set the scroll position to after the locked section
        window.scrollTo(0, originalScrollPosition + lockHeight);
        
        // Cleanup wheel event listener
        window.removeEventListener('wheel', handleWheel);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      // Ensure we clean up the body styles when component unmounts
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, []);

  return (
    <ChladniPattern>
      <div id="values-section" className="w-full mb-48 py-0">
        {/* Semi-transparent red box that takes up full screen height */}
        <div 
          className="h-screen w-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(234, 56, 76, 0.7)' }} // Semi-transparent red
        />
      </div>
    </ChladniPattern>
  );
};

export default Values;
