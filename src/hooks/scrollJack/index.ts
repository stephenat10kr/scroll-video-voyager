
import { UseScrollJackProps, ScrollJackState } from './types';
import { useScrollJackState } from './useScrollJackState';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useEventHandlers } from './useEventHandlers';
import { useCleanup } from './useCleanup';

export const useScrollJack = (props: UseScrollJackProps): ScrollJackState => {
  // Get state and setters
  const {
    state,
    setIsActive,
    setCurrentSectionIndex,
    setCompleted,
    isScrollingRef,
    lastScrollTimeRef,
    hasStartedRef,
    isActivatedRef,
    SCROLL_THROTTLE
  } = useScrollJackState();

  // Setup intersection observer
  useIntersectionObserver(props, {
    isActivatedRef,
    hasStartedRef,
    setIsActive,
    setCompleted,
    currentSectionIndex: state.currentSectionIndex,
    completed: state.completed,
    onComplete: props.onComplete
  });

  // Setup event handlers
  useEventHandlers(props, {
    isScrollingRef,
    lastScrollTimeRef,
    hasStartedRef,
    setCurrentSectionIndex,
    currentSectionIndex: state.currentSectionIndex,
    SCROLL_THROTTLE,
    setCompleted,
    isActive: state.isActive,
    completed: state.completed,
    onComplete: props.onComplete
  });

  // Setup cleanup
  useCleanup({
    containerRef: props.containerRef,
    sectionRefs: props.sectionRefs,
    hasStartedRef,
    isActivatedRef,
    setCompleted,
    setIsActive,
    setCurrentSectionIndex
  });

  return state;
};

// Re-export types for convenience
export type { UseScrollJackProps, ScrollJackState };
