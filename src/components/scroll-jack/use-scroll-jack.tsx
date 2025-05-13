
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

  // Setup Intersection Observer to detect when component enters/exits viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsComponentVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  // Track if user has viewed all sections
  useEffect(() => {
    if (activeSection === sectionCount - 1) {
      setHasViewedAllSections(true);
    }
  }, [activeSection, sectionCount]);

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
    }
    
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 700); // Match transition duration from CSS
  }, [activeSection, isAnimating, sectionCount]);

  const handleWheelEvent = useCallback((event: React.WheelEvent) => {
    // Only take over scrolling when the component is visible
    if (!isComponentVisible) {
      return; // Let normal scrolling happen when not in view
    }
    
    // Don't handle wheel events during animation
    if (isAnimating) {
      event.preventDefault();
      return;
    }
    
    // Allow normal scrolling to resume when:
    // 1. We've reached the last section
    // 2. User is scrolling down (to continue past the component)
    if (activeSection === sectionCount - 1 && event.deltaY > 0) {
      return; // Don't prevent default - let normal scrolling take over
    }
    
    // In all other cases when component is visible, take over scrolling
    event.preventDefault();
    
    if (event.deltaY > 0 && activeSection < sectionCount - 1) {
      // Scrolling down
      goToSection(activeSection + 1, 'down');
    } else if (event.deltaY < 0 && activeSection > 0) {
      // Scrolling up
      goToSection(activeSection - 1, 'up');
    }
  }, [activeSection, isAnimating, sectionCount, isComponentVisible, goToSection]);

  const handleSectionChange = useCallback((sectionIndex: number) => {
    const direction = sectionIndex > activeSection ? 'down' : 'up';
    goToSection(sectionIndex, direction);
  }, [activeSection, goToSection]);

  // Reset state when component is not visible
  useEffect(() => {
    if (!isComponentVisible) {
      setActiveSection(0);
      setPreviousSection(null);
      setAnimationDirection(null);
      setHasReachedEnd(false);
      setHasViewedAllSections(false);
    }
  }, [isComponentVisible]);

  return {
    activeSection,
    previousSection,
    animationDirection,
    hasReachedEnd,
    handleSectionChange,
    handleWheelEvent
  };
}
