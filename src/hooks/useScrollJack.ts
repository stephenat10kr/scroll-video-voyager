
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
  const hasStartedRef = useRef(false);

  // Set up intersection observer to detect when the container is visible
  useEffect(() => {
    if (!containerRef.current || sectionRefs.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (!hasStartedRef.current) {
            console.log("Container is visible, activating scroll jack");
            setIsActive(true);
            hasStartedRef.current = true;
            
            // Lock scrolling
            document.body.style.overflow = 'hidden';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: true } });
            window.dispatchEvent(window.scrollLockEvent);
          }
        } else if (!entry.isIntersecting && hasStartedRef.current && completed) {
          console.log("Container is no longer visible and completed, deactivating");
          setIsActive(false);
          
          // Release scroll lock
          document.body.style.overflow = '';
          window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
          window.dispatchEvent(window.scrollLockEvent);
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
      document.body.style.overflow = '';
      window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
      window.dispatchEvent(window.scrollLockEvent);
    };
  }, [containerRef, sectionRefs, completed]);

  // Handle wheel events when active
  useEffect(() => {
    if (!isActive || sectionRefs.length === 0) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (completed) return;
      
      // Implement throttling for smoother transitions
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 700) return; // 700ms throttle
      lastScrollTimeRef.current = now;
      
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      
      // Determine scroll direction
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // Calculate new section index
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      console.log(`Scroll event: direction=${direction > 0 ? 'down' : 'up'}, Current=${currentSectionIndex}, New=${newIndex}`);
      
      // Only proceed if we're actually moving to a new section
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        // Check if we've reached the end
        if (newIndex === sectionRefs.length - 1) {
          setTimeout(() => {
            console.log("Reached last section, completing scroll jack");
            setCompleted(true);
            if (onComplete) onComplete();
            
            // Release scroll lock
            document.body.style.overflow = '';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 1500); // Wait for animation to complete
        }
      }
      
      // Reset scrolling state after animation completes
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      wheelTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };
    
    // Add event listener with capture to handle wheel events
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || completed) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTimeRef.current < 700) return;
        lastScrollTimeRef.current = now;
        
        if (currentSectionIndex < sectionRefs.length - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
        } else if (currentSectionIndex === sectionRefs.length - 1) {
          setCompleted(true);
          if (onComplete) onComplete();
          
          // Release scroll lock
          document.body.style.overflow = '';
          window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
          window.dispatchEvent(window.scrollLockEvent);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTimeRef.current < 700) return;
        lastScrollTimeRef.current = now;
        
        if (currentSectionIndex > 0) {
          setCurrentSectionIndex(currentSectionIndex - 1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      
      // Release scroll lock
      document.body.style.overflow = '';
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
      
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 700) return;
      lastScrollTimeRef.current = now;
      
      const direction = touchDiff < 0 ? 1 : -1; // Negative diff means swiping up (next section)
      const newIndex = Math.max(0, Math.min(sectionRefs.length - 1, currentSectionIndex + direction));
      
      if (newIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newIndex);
        
        if (newIndex === sectionRefs.length - 1) {
          setTimeout(() => {
            setCompleted(true);
            if (onComplete) onComplete();
            
            // Release scroll lock
            document.body.style.overflow = '';
            window.scrollLockEvent = new CustomEvent('scrollLock', { detail: { locked: false } });
            window.dispatchEvent(window.scrollLockEvent);
          }, 1000);
        }
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, currentSectionIndex, sectionRefs, completed, onComplete]);

  return {
    isActive,
    currentSectionIndex,
    completed
  };
};
