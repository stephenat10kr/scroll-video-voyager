
import { useEffect, useState } from "react";

interface DeviceInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isFirefox: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isFirefox: false
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Mobile detection
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Android detection
    const isAndroid = /android/i.test(userAgent) || /android/i.test(navigator.platform);
    
    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(userAgent) && !window.MSStream;
    
    // Firefox detection
    const isFirefox = userAgent.indexOf('firefox') > -1;
    
    setDeviceInfo({
      isMobile,
      isAndroid,
      isIOS,
      isFirefox
    });
    
    console.log("Device detection:", { isMobile, isAndroid, isIOS, isFirefox });
  }, []);

  return deviceInfo;
}
