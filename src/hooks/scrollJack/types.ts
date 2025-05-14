
import { RefObject } from 'react';

export interface UseScrollJackProps {
  containerRef: RefObject<HTMLElement>;
  sectionRefs: RefObject<HTMLElement>[];
  firstSectionRef?: RefObject<HTMLElement>; // Optional ref specifically for the first section
  onComplete?: () => void;
  threshold?: number;
}

export interface ScrollJackState {
  isActive: boolean;
  currentSectionIndex: number;
  completed: boolean;
}
