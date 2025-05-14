
import { RefObject } from 'react';

export interface UseScrollJackProps {
  containerRef: RefObject<HTMLElement>;
  sectionRefs: RefObject<HTMLElement>[];
  onComplete?: () => void;
  threshold?: number;
}

export interface ScrollJackState {
  isActive: boolean;
  currentSectionIndex: number;
  completed: boolean;
}
