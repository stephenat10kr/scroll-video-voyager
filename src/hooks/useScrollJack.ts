
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
  // Core state
  const [isActive, setIsActive] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Refs for internal state tracking
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(Date.now());
  const hasStartedRef = useRef(false);
  const isActivatedRef = useRef(false);
  
  // Constants
  const SCROLL_THROTTLE = 600; // ms between scroll events
  const INTERSECTION_THRESHOLD = 0.3; // When to activate scrolljack
  
  // Reset everything when component unmounts or changes
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      if (window.scrollLockEvent) {
        window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
        window.dispatchEvent(window.scrollLockEvent);
      }
      hasStartedRef.current = false;
      isActivatedRef.current = false;
      setCompleted(false);
      setIsActive(false);
      setCurrentSectionIndex(0);
    };
  }, [containerRef, sectionRefs]);
  
  // Create intersection observer to detect when container is visible
  useEffect(() => {
    if (!containerRef.current || sectionRefs.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Activate when container comes into view
        if (entry.isIntersecting && entry.intersectionRatio > INTERSECTION_THRESHOLD) {
          if (!isActivatedRef.current) {
            console.log("Container is visible, activating scroll jack");
            setIsActive(true);
            isActivatedRef.current = true;
            
            // Lock body scrolling
            document.body.style.overflow = 'hidden';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: true } });
            window.dispatchEvent(window.scrollLockEvent);
          }
        }
        // If we've scrolled past and completed, deactivate
        else if (!entry.isIntersecting && completed) {
          console.log("Scroll section passed, releasing scroll lock");
          setIsActive(false);
          
          document.body.style.overflow = '';
          window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
          window.dispatchEvent(window.scrollLockEvent);
        }
      },
      { threshold: [INTERSECTION_THRESHOLD, 0.5] }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, sectionRefs, completed]);

  // Handle wheel, touch, and keyboard events
  useEffect(() => {
    if (!isActive || sectionRefs.length === 0) return;
    
    // Wheel event handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (completed) return;
      
      // Throttle scrolling
      const now = Date.now();
      if (now - lastScrollTimeRef.current < SCROLL_THROTTLE) return;
      lastScrollTimeRef.current = now;
      
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      
      // Get scroll direction
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // Update section index
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      if (newIndex !== currentSectionIndex) {
        console.log(`Moving to section ${newIndex}`);
        setCurrentSectionIndex(newIndex);
        
        // Check if we've reached the last section
        if (newIndex === sectionRefs.length - 1 && direction > 0) {
          setTimeout(() => {
            console.log("Reached last section, completing scroll jack");
            setCompleted(true);
            if (onComplete) onComplete();
            
            document.body.style.overflow = '';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 800);
        }
      }
      
      // Reset scrolling state after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_THROTTLE);
    };
    
    // Touch event handlers
    let touchStartY = 0;
    const touchThreshold = 50;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (completed) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchEndY - touchStartY;
      
      // Only respond to significant swipes
      if (Math.abs(touchDiff) < touchThreshold) return;
      
      const now = Date.now();
      if (now - lastScrollTimeRef.current < SCROLL_THROTTLE) return;
      lastScrollTimeRef.current = now;
      
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      
      const direction = touchDiff < 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        if (newIndex === sectionRefs.length - 1 && direction > 0) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
            
            document.body.style.overflow = '';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 800);
        }
      }
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_THROTTLE);
    };
    
    // Keyboard event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;
      
      const now = Date.now();
      if (now - lastScrollTimeRef.current < SCROLL_THROTTLE) return;
      
      let direction = 0;
      
      if (e.key === 'ArrowDown' || e.key === 'Space') {
        e.preventDefault();
        direction = 1;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        direction = -1;
      } else {
        return;
      }
      
      if (direction === 0 || isScrollingRef.current) return;
      
      lastScrollTimeRef.current = now;
      isScrollingRef.current = true;
      
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        if (newIndex === sectionRefs.length - 1 && direction > 0) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
            
            document.body.style.overflow = '';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 800);
        }
      }
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_THROTTLE);
    };
    
    // Set up event listeners
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete]);

  return {
    isActive,
    currentSection: currentSectionIndex,
    completed
  };
};
