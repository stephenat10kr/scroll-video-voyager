
/**
 * Custom hook to detect if the current device is running iOS
 */
export const useIsIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check for iOS devices by looking for common iOS platform identifiers
  // Removed MSStream check which was causing TypeScript error
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  return isIOS;
};
