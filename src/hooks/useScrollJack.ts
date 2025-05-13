
import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollJackProps {
  containerRef: RefObject<HTMLElement>;
  sectionRefs: RefObject<HTMLElement>[];
  onComplete?: () => void;
}

export const useScrollJack = ({ 
  containerRef, 
  sectionRefs, 
  onComplete 
}: UseScrollJackProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const isScrollingRef = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up intersection observer to detect when the container is visible
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setIsActive(true);
        } else {
          // Only deactivate if we've completed all sections
          if (completed) {
            setIsActive(false);
          }
        }
      },
      { threshold: [0.2, 0.5, 0.8] }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, completed]);

  // Handle wheel events when active
  useEffect(() => {
    if (!isActive) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (completed) return;
      
      e.preventDefault();
      
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      
      // Determine scroll direction
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // Calculate new section index
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      // Only proceed if we're actually moving to a new section
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        // Check if we've reached the end
        if (newIndex === sectionRefs.length - 1) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
          }, 1000); // Wait for animation to complete
        }
      }
      
      // Debounce scrolling
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      wheelTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };
    
    // Add event listener to handle wheel events
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete]);

  return {
    isActive,
    currentSectionIndex,
    completed,
  };
};
