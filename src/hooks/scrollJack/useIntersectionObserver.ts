
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
    
    // Simple and direct approach: observe when the container hits the viewport top
    const containerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Check if container is intersecting and near top of viewport
        if (entry.isIntersecting) {
          // Get the bounding rect of the container to check position
          const rect = containerRef.current?.getBoundingClientRect();
          
          // Activate when top of container is near top of viewport (within 50px)
          if (rect && rect.top <= 50 && rect.top >= -50) {
            if (!isActivatedRef.current) {
              console.log("Values container at top of viewport, activating scroll jack");
              setIsActive(true);
              isActivatedRef.current = true;
              hasStartedRef.current = true;
              
              // Lock body scrolling
              document.body.style.overflow = 'hidden';
              window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: true } }));
            }
          }
        }
        
        // Deactivate when scrolled past bottom of viewport or completed
        if ((!entry.isIntersecting && entry.boundingClientRect.top < 0) || completed) {
          // Only complete if we've reached the last section
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
      // Use a smaller threshold and negative rootMargin to detect earlier
      { threshold: [0, 0.1, 0.2], rootMargin: "-20px 0px 0px 0px" }
    );
    
    containerObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        containerObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef, sectionRefs, threshold, onComplete, currentSectionIndex, completed, setIsActive, setCompleted, isActivatedRef, hasStartedRef]);
};
