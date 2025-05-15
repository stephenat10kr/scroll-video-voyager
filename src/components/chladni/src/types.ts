
import React from 'react';

export interface ChladniScrollJackProps {
  children?: React.ReactNode;
  titles?: string[];
}

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export interface ScrollJackContainerProps {
  children: React.ReactNode; 
  titles?: string[];
}

export interface UseScrollJackResult {
  containerRef: React.RefObject<HTMLDivElement>;
  activeSection: number;
  previousSection: number | null;
  animationDirection: 'up' | 'down';
  sectionCount: number;
  sectionTitles: React.ReactNode[];
  hasReachedEnd: boolean;
  setActiveSection: React.Dispatch<React.SetStateAction<number>>;
  setPreviousSection: React.Dispatch<React.SetStateAction<number | null>>;
  setAnimationDirection: React.Dispatch<React.SetStateAction<'up' | 'down'>>;
  setHasReachedEnd: React.Dispatch<React.SetStateAction<boolean>>;
}
