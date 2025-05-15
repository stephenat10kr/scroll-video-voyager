
import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseScrolljackingOptions {
  sectionCount: number;
  onProgress?: (progress: number) => void;
  onSectionChange?: (index: number) => void;
  enabled?: boolean;
}

export const useScrolljacking = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrolljackingOptions
) => {
  const { sectionCount, onProgress, onSectionChange, enabled = true } = options;
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  const cleanup = useCallback(() => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
    
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  }, []);
  
  const refreshScrollTrigger = useCallback(() => {
    // Force a refresh of ScrollTrigger with slight delay
    setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 100);
  }, []);
  
  useEffect(() => {
    if (!enabled || !containerRef.current || sectionCount <= 0) return;
    
    // Create a timeline for the scrolljacking
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: `+=${sectionCount * 100}vh`,
        scrub: 0.5,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          // Update progress
          const currentProgress = self.progress;
          setProgress(currentProgress);
          
          if (onProgress) {
            onProgress(currentProgress);
          }
          
          // Calculate current section
          const newSectionIndex = Math.min(
            sectionCount - 1,
            Math.floor(currentProgress * sectionCount)
          );
          
          if (newSectionIndex !== currentSection) {
            setCurrentSection(newSectionIndex);
            if (onSectionChange) {
              onSectionChange(newSectionIndex);
            }
          }
        }
      }
    });
    
    timelineRef.current = tl;
    scrollTriggerRef.current = tl.scrollTrigger as ScrollTrigger;
    
    // Handle window resize
    const handleResize = () => {
      refreshScrollTrigger();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [sectionCount, containerRef, enabled, onProgress, onSectionChange, cleanup, refreshScrollTrigger, currentSection]);
  
  // Return useful values and functions
  return {
    progress,
    currentSection,
    refresh: refreshScrollTrigger,
    cleanup
  };
};
