
import { useEffect } from 'react';
import { UseScrollJackProps } from './types';

interface ScrollJackStateHandlers {
  isScrollingRef: React.MutableRefObject<boolean>;
  lastScrollTimeRef: React.MutableRefObject<number>;
  hasStartedRef: React.MutableRefObject<boolean>;
  setCurrentSectionIndex: (index: number) => void;
  currentSectionIndex: number;
  SCROLL_THROTTLE: number;
  setCompleted: (completed: boolean) => void;
  isActive: boolean;
  completed: boolean;
  onComplete?: () => void;
}

export const useEventHandlers = (
  props: UseScrollJackProps,
  stateHandlers: ScrollJackStateHandlers
) => {
  const { sectionRefs } = props;
  const {
    isScrollingRef,
    lastScrollTimeRef,
    hasStartedRef,
    setCurrentSectionIndex,
    currentSectionIndex,
    SCROLL_THROTTLE,
    setCompleted,
    isActive,
    completed,
    onComplete
  } = stateHandlers;
  
  // Handle wheel, touch, and keyboard events
  useEffect(() => {
    if (!isActive || sectionRefs.length === 0) return;
    hasStartedRef.current = true;
    
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
            window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: false } }));
          }, 1000);
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
            window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: false } }));
          }, 1000);
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
            window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: false } }));
          }, 1000);
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
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete, SCROLL_THROTTLE]);
};
