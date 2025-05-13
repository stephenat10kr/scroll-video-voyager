
import React, { useEffect, useRef, useState } from 'react';
import { extractSectionTitles } from './utils';

export const useScrollJack = (children: React.ReactNode) => {
  // Create refs and state in consistent order (prevents React hook order errors)
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [previousSection, setPreviousSection] = useState<number | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isScrollJackActive, setIsScrollJackActive] = useState(false);
  
  // Add scroll sensitivity threshold
  const scrollThreshold = useRef(50); // Higher value = less sensitive
  const scrollAccumulator = useRef(0);
  const transitionTimeoutRef = useRef<number | null>(null);
  
  const childrenArray = React.Children.toArray(children);
  const sectionCount = childrenArray.length;
  
  // Extract titles from each section for the fixed title
  const sectionTitles = extractSectionTitles(children);
  
  // Handle cleanup of timeouts
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only process wheel events when scroll-jacking is active
      if (!isScrollJackActive) return;
      
      // Allow normal scrolling if we've reached the end
      if (hasReachedEnd) {
        return; // Let the event propagate naturally
      }
      
      // Prevent default in all other cases while in scrolljack mode
      e.preventDefault();
      
      // Don't process scroll if already scrolling
      if (isScrolling) return;
      
      // Accumulate scroll value to reduce sensitivity
      scrollAccumulator.current += Math.abs(e.deltaY);
      
      // Only trigger scroll action if the accumulated value exceeds the threshold
      if (scrollAccumulator.current > scrollThreshold.current) {
        setIsScrolling(true);
        
        // Determine scroll direction
        const direction = e.deltaY > 0 ? 1 : -1;
        
        if (direction > 0) {
          // Scrolling down
          setAnimationDirection('up');
          setPreviousSection(activeSection);
          
          if (activeSection < sectionCount - 1) {
            // Move to next section
            setActiveSection(activeSection + 1);
          } else {
            // We're at the last section, allow normal scrolling
            setHasReachedEnd(true);
          }
        } else if (direction < 0) {
          // Scrolling up
          if (activeSection > 0) {
            setAnimationDirection('down');
            setPreviousSection(activeSection);
            setActiveSection(activeSection - 1);
          }
        }
        
        // Reset accumulator after action is triggered
        scrollAccumulator.current = 0;
        
        // Add delay before allowing another scroll
        transitionTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 700); // Adjust timing as needed for smooth transitions
      }
    };
    
    // Add the wheel event listener to the document if scrolljacking is active
    if (isScrollJackActive) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [activeSection, isScrolling, sectionCount, hasReachedEnd, isScrollJackActive]);

  return {
    containerRef,
    activeSection,
    previousSection,
    animationDirection,
    sectionCount,
    sectionTitles,
    hasReachedEnd,
    isScrollJackActive,
    setActiveSection,
    setPreviousSection,
    setAnimationDirection,
    setHasReachedEnd,
    setIsScrollJackActive
  };
};
