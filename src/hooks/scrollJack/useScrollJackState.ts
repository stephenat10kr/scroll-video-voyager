
import { useState, useRef } from 'react';
import { ScrollJackState } from './types';

export const useScrollJackState = () => {
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
  const SCROLL_THROTTLE = 700; // Time between scroll events

  const state: ScrollJackState = {
    isActive,
    currentSectionIndex,
    completed
  };

  return {
    state,
    setIsActive,
    setCurrentSectionIndex,
    setCompleted,
    isScrollingRef,
    lastScrollTimeRef,
    hasStartedRef,
    isActivatedRef,
    SCROLL_THROTTLE
  };
};
