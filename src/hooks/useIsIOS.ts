
/**
 * Custom hook to detect if the current device is running iOS
 */
export const useIsIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // More comprehensive iOS detection
  const userAgent = navigator.userAgent;
  
  // Check for iPhone, iPad, iPod or iOS in the user agent
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || 
                /iOS/i.test(userAgent) ||
                // Also detect iOS Safari browser
                (/Safari/i.test(userAgent) && /Apple Computer/.test(navigator.vendor));
  
  return isIOS;
};
