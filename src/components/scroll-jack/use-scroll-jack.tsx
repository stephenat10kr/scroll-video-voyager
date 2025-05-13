
import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseScrollJackProps {
  sectionCount: number;
  containerRef: RefObject<HTMLDivElement>;
}

interface UseScrollJackReturn {
  activeSection: number;
  previousSection: number | null;
  animationDirection: 'up' | 'down' | null;
  hasReachedEnd: boolean;
  handleSectionChange: (sectionIndex: number) => void;
  handleWheelEvent: (event: React.WheelEvent) => void;
}

export function useScrollJack({
  sectionCount,
  containerRef
}: UseScrollJackProps): UseScrollJackReturn {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [previousSection, setPreviousSection] = useState<number | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [hasViewedAllSections, setHasViewedAllSections] = useState<boolean>(false);
  const [isComponentVisible, setIsComponentVisible] = useState<boolean>(false);
  const [isFullyVisible, setIsFullyVisible] = useState<boolean>(false);
  const [hasPassedAllSections, setHasPassedAllSections] = useState<boolean>(false);
  const [hasCompletedAllTransitions, setHasCompletedAllTransitions] = useState<boolean>(false);

  // Setup Intersection Observer to detect when component enters/exits viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Observer for detecting any visibility
    const partialObserver = new IntersectionObserver(
      ([entry]) => {
        setIsComponentVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    // Observer for detecting full visibility (100% in viewport)
    const fullObserver = new IntersectionObserver(
      ([entry]) => {
        setIsFullyVisible(entry.isIntersecting);
        // Reset if component becomes fully visible again after navigating away
        if (entry.isIntersecting && !hasCompletedAllTransitions) {
          setActiveSection(0);
          setPreviousSection(null);
          setAnimationDirection(null);
          setHasReachedEnd(false);
        }
      },
      { threshold: 1.0 } // Ensure component is 100% visible
    );
    
    partialObserver.observe(containerRef.current);
    fullObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        partialObserver.unobserve(containerRef.current);
        fullObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef, hasCompletedAllTransitions]);

  // Track if user has viewed all sections
  useEffect(() => {
    if (activeSection === sectionCount - 1) {
      setHasViewedAllSections(true);
      
      // Mark as completed transitions only when we've reached the last section
      // and animation has finished
      if (!isAnimating) {
        setHasCompletedAllTransitions(true);
      }
    }
  }, [activeSection, sectionCount, isAnimating]);

  const goToSection = useCallback((nextSection: number, direction: 'up' | 'down') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPreviousSection(activeSection);
    setActiveSection(nextSection);
    setAnimationDirection(direction);
    
    // Check if we've reached the end of the sections
    if (nextSection >= sectionCount - 1) {
      setHasReachedEnd(true);
    } else {
      setHasReachedEnd(false);
      // Reset completion state if going back from the end
      setHasCompletedAllTransitions(false);
    }
    
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
      
      // Mark as having passed all sections if we're at the last section
      if (nextSection === sectionCount - 1) {
        setHasPassedAllSections(true);
      }
    }, 700); // Match transition duration from CSS
  }, [activeSection, isAnimating, sectionCount]);

  const handleWheelEvent = useCallback((event: React.WheelEvent) => {
    // Don't handle wheel events during animation
    if (isAnimating) {
      event.preventDefault();
      return;
    }
    
    // Only take over scrolling when the component is fully visible
    if (!isFullyVisible) {
      return;
    }
    
    // Allow normal scrolling to resume only when:
    // 1. We've viewed all sections
    // 2. We've completed all transitions
    // 3. We're at the last section
    // 4. User is scrolling down (to continue past the component)
    if (hasCompletedAllTransitions && 
        hasPassedAllSections && 
        activeSection === sectionCount - 1 && 
        event.deltaY > 0) {
      return; // Don't prevent default - let normal scrolling take over
    }
    
    // In all other cases when component is fully visible, take over scrolling
    event.preventDefault();
    
    if (event.deltaY > 0 && activeSection < sectionCount - 1) {
      // Scrolling down
      goToSection(activeSection + 1, 'down');
    } else if (event.deltaY < 0 && activeSection > 0) {
      // Scrolling up
      goToSection(activeSection - 1, 'up');
    }
  }, [
    activeSection,
    isAnimating, 
    sectionCount, 
    isFullyVisible, 
    goToSection, 
    hasPassedAllSections,
    hasCompletedAllTransitions
  ]);

  const handleSectionChange = useCallback((sectionIndex: number) => {
    const direction = sectionIndex > activeSection ? 'down' : 'up';
    goToSection(sectionIndex, direction);
  }, [activeSection, goToSection]);

  // Reset state when component is not visible
  useEffect(() => {
    if (!isComponentVisible && !isFullyVisible) {
      // Only reset if we're not in the middle of viewing
      if (!hasCompletedAllTransitions) {
        setActiveSection(0);
        setPreviousSection(null);
        setAnimationDirection(null);
      }
      setHasReachedEnd(false);
      setHasViewedAllSections(false);
    }
  }, [isComponentVisible, isFullyVisible, hasCompletedAllTransitions]);

  return {
    activeSection,
    previousSection,
    animationDirection,
    hasReachedEnd,
    handleSectionChange,
    handleWheelEvent
  };
}
