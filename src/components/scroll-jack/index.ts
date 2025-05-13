
// Export main component
export { default as ScrollJackContainer } from '../ScrollJackContainer';

// Export subcomponents
export { default as ScrollJackTitle } from './ScrollJackTitle';
export { default as NavigationDots } from './NavigationDots';

// Export hook and utilities
export { useScrollJack } from './use-scroll-jack';
export { createModifiedSection, extractSectionTitles } from './utils';

// Export types
export type { ScrollJackContainerProps } from './types';
