
import { useEffect } from 'react';

interface CleanupProps {
  containerRef: React.RefObject<HTMLElement>;
  sectionRefs: React.RefObject<HTMLElement>[];
  hasStartedRef: React.MutableRefObject<boolean>;
  isActivatedRef: React.MutableRefObject<boolean>;
  setCompleted: (completed: boolean) => void;
  setIsActive: (isActive: boolean) => void;
  setCurrentSectionIndex: (index: number) => void;
}

export const useCleanup = ({
  containerRef,
  sectionRefs,
  hasStartedRef,
  isActivatedRef,
  setCompleted,
  setIsActive,
  setCurrentSectionIndex
}: CleanupProps) => {
  // Reset everything when component unmounts or changes
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('scrollLock', { detail: { locked: false } }));
      hasStartedRef.current = false;
      isActivatedRef.current = false;
      setCompleted(false);
      setIsActive(false);
      setCurrentSectionIndex(0);
    };
  }, [containerRef, sectionRefs, hasStartedRef, isActivatedRef, setCompleted, setIsActive, setCurrentSectionIndex]);
};
