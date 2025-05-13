
import React from 'react';

/**
 * Extract titles from the children components for display in the fixed title element
 */
export const extractSectionTitles = (children: React.ReactNode): React.ReactNode[] => {
  const titles: React.ReactNode[] = [];
  
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.props.title) {
      titles.push(child.props.title);
    } else {
      // Use a default empty title as placeholder if no title prop is found
      titles.push('');
    }
  });
  
  return titles;
};

/**
 * Create a modified section with additional props for scroll-jack behavior
 */
export const createModifiedSection = (
  child: React.ReactElement, 
  isActive: boolean,
  isPrevious: boolean,
  animationDirection: 'up' | 'down'
) => {
  return React.cloneElement(child, {
    isActive,
    isPrevious,
    animationDirection,
    key: child.key || `section-${Math.random()}`
  });
};
