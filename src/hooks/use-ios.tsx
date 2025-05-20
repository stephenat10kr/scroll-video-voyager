
import { useState, useEffect } from 'react';

/**
 * Custom hook to detect iOS devices
 * @returns boolean indicating if the current device is running iOS
 */
export const useIsIOS = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check for iOS devices (iPad, iPhone, iPod)
    // MSStream is used to exclude IE11 which also reports itself as iPad
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    if (iOS) {
      console.log("iOS device detected");
    }
  }, []);

  return isIOS;
};
