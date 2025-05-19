
import { useEffect, useState } from "react";

export const useIsAndroid = (): boolean => {
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    // Check user agent for Android
    const userAgent = navigator.userAgent.toLowerCase();
    
    // More comprehensive Android detection
    const isAndroidDevice = 
      /android/i.test(userAgent) || 
      // Check for Android-specific browser signatures
      /android.*chrome/i.test(userAgent) ||
      // Some devices identify as Linux + Mobile
      (/linux/i.test(userAgent) && /mobile/i.test(userAgent));
    
    console.log("User Agent:", userAgent);
    console.log("Is Android detected:", isAndroidDevice);
    
    setIsAndroid(isAndroidDevice);
  }, []);
  
  return isAndroid;
};

export default useIsAndroid;
