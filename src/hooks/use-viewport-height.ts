
import { useState, useEffect } from 'react';
import { useIsIOS } from './use-ios';

/**
 * Custom hook to handle viewport height calculations consistently across devices
 * Particularly useful for iOS where vh units have known issues
 */
export const useViewportHeight = () => {
  const isIOS = useIsIOS();
  const [height, setHeight] = useState<number>(window.innerHeight);
  
  // Set a CSS variable for viewport height that can be used throughout the app
  const setViewportHeightVariable = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    // Set the viewport height CSS variable on initial render
    setViewportHeightVariable();
    
    // Update the viewport height variable on resize
    window.addEventListener('resize', setViewportHeightVariable);
    
    // iOS specific: update on orientation change
    if (isIOS) {
      window.addEventListener('orientationchange', setViewportHeightVariable);
      
      // Force update after a small delay on iOS to ensure correct calculation
      const timeout = setTimeout(() => {
        setViewportHeightVariable();
      }, 100);
      
      return () => {
        window.removeEventListener('resize', setViewportHeightVariable);
        window.removeEventListener('orientationchange', setViewportHeightVariable);
        clearTimeout(timeout);
      };
    }
    
    return () => {
      window.removeEventListener('resize', setViewportHeightVariable);
    };
  }, [isIOS]);

  return height;
};
