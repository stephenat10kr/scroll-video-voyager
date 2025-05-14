
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
  const { containerRef, sectionRefs, threshold = 0.1, firstSectionRef } = props;
  
  useEffect(() => {
    if (!containerRef.current || sectionRefs.length === 0) return;
    
    // Create an observer for the container to detect when it's in view
    const containerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Only check if container is in the viewport
        if (entry.isIntersecting) {
          // Container is in view, now we'll rely on the first section observer
          // for precise activation
          console.log("Container in viewport, ready for scroll jack activation");
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
      { threshold: [0], rootMargin: "0px 0px 0px 0px" }
    );
    
    containerObserver.observe(containerRef.current);

    // Create observer for the first section to precisely determine when to activate
    // Use firstSectionRef if provided, otherwise use the first section ref
    const targetRef = firstSectionRef?.current || sectionRefs[0]?.current;
    
    if (targetRef) {
      const firstSectionObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          
          // Activate when first section reaches top of viewport
          if (entry.isIntersecting && entry.boundingClientRect.top <= 10) {
            if (!isActivatedRef.current) {
              console.log("First value at top of viewport, activating scroll jack");
              setIsActive(true);
              isActivatedRef.current = true;
              
              // Lock body scrolling
              document.body.style.overflow = 'hidden';
              window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: true } }));
            }
          }
        },
        { threshold: [0, threshold], rootMargin: "0px 0px 0px 0px" }
      );
      
      firstSectionObserver.observe(targetRef);
      
      return () => {
        if (containerRef.current) {
          containerObserver.unobserve(containerRef.current);
        }
        if (targetRef) {
          firstSectionObserver.unobserve(targetRef);
        }
      };
    }
    
    return () => {
      if (containerRef.current) {
        containerObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef, sectionRefs, firstSectionRef, threshold, onComplete, currentSectionIndex, completed, setIsActive, setCompleted, isActivatedRef, hasStartedRef]);
};
