
import { useEffect } from 'react';
import { UseScrollJackProps } from './types';

export const useIntersectionObserver = (
  props: UseScrollJackProps,
  {
    isActivatedRef,
    hasStartedRef,
    setIsActive,
    setCompleted,
    currentSectionIndex,
    completed,
    onComplete
  }: {
    isActivatedRef: React.MutableRefObject<boolean>;
    hasStartedRef: React.MutableRefObject<boolean>;
    setIsActive: (isActive: boolean) => void;
    setCompleted: (completed: boolean) => void;
    currentSectionIndex: number;
    completed: boolean;
    onComplete?: () => void;
  }
) => {
  const { containerRef, sectionRefs, threshold = 0.1 } = props;
  
  useEffect(() => {
    if (!containerRef.current || sectionRefs.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Only activate when container reaches top of viewport
        if (entry.isIntersecting && entry.boundingClientRect.top <= 10) {
          if (!isActivatedRef.current) {
            console.log("Values at top of viewport, activating scroll jack");
            setIsActive(true);
            isActivatedRef.current = true;
            
            // Lock body scrolling
            document.body.style.overflow = 'hidden';
            window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: true } }));
          }
        }
        // Deactivate when scrolled past and we've viewed all sections
        else if ((!entry.isIntersecting && entry.boundingClientRect.top < 0) || completed) {
          if (hasStartedRef.current && currentSectionIndex >= sectionRefs.length - 1) {
            console.log("Scroll section passed or completed, releasing scroll lock");
            setIsActive(false);
            setCompleted(true);
            
            document.body.style.overflow = '';
            window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: false } }));
            
            if (onComplete) onComplete();
          }
        }
      },
      { threshold: [0, threshold], rootMargin: "0px 0px 0px 0px" }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, sectionRefs, threshold, onComplete, currentSectionIndex, completed, setIsActive, setCompleted, isActivatedRef, hasStartedRef]);
};
