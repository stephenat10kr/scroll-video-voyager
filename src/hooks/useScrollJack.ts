
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
  const lastScrollTimeRef = useRef<number>(0);

  // Set up intersection observer to detect when the container is visible
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setIsActive(true);
          // Dispatch custom event to notify about scroll lock
          window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: true } });
          window.dispatchEvent(window.scrollLockEvent);
        } else {
          // Only deactivate if we've completed all sections
          if (completed) {
            setIsActive(false);
            // Release scroll lock
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
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
      // Always release scroll lock when unmounting
      window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
      window.dispatchEvent(window.scrollLockEvent);
    };
  }, [containerRef, completed]);

  // Handle wheel events when active
  useEffect(() => {
    if (!isActive || sectionRefs.length === 0) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (completed) return;
      
      // Always prevent default scroll behavior when we're active
      e.preventDefault();
      
      // Implement throttling for smoother transitions
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 500) return; // 500ms throttle
      lastScrollTimeRef.current = now;
      
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      
      // Determine scroll direction
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // Calculate new section index
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      console.log(`Scroll direction: ${direction > 0 ? 'down' : 'up'}, Current index: ${currentSectionIndex}, New index: ${newIndex}`);
      
      // Only proceed if we're actually moving to a new section
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        // Check if we've reached the end
        if (newIndex === sectionRefs.length - 1) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
            
            // Release scroll lock
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 1000); // Wait for animation to complete
        }
      }
      
      // Reset scrolling state after animation completes
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      wheelTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 700); // Slightly shorter than the animation duration for better responsiveness
    };
    
    // Add event listener to handle wheel events
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Handle keyboard navigation as well
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || completed) return;
      
      // Handle arrow keys for accessibility
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentSectionIndex < sectionRefs.length - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
        } else if (currentSectionIndex === sectionRefs.length - 1) {
          setCompleted(true);
          if (onComplete) onComplete();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSectionIndex > 0) {
          setCurrentSectionIndex(currentSectionIndex - 1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      // Always release scroll lock when effect is cleaned up
      window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
      window.dispatchEvent(window.scrollLockEvent);
    };
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete]);

  // Handle touch events for mobile
  useEffect(() => {
    if (!isActive || sectionRefs.length === 0) return;
    
    let touchStartY = 0;
    const touchThreshold = 50; // Minimum swipe distance
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (completed) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchEndY - touchStartY;
      
      // Only respond to significant swipes
      if (Math.abs(touchDiff) < touchThreshold) return;
      
      const direction = touchDiff < 0 ? 1 : -1; // Negative diff means swiping up (next section)
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        if (newIndex === sectionRefs.length - 1) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
          }, 1000);
        }
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete]);

  return {
    isActive,
    currentSectionIndex,
    completed,
  };
};
