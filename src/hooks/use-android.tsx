
import * as React from "react";

export function useIsAndroid() {
  const [isAndroid, setIsAndroid] = React.useState<boolean>(false);

  React.useEffect(() => {
    const detectAndroid = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Look for explicit Android mentions in the user agent
      const isAndroidDevice = 
        userAgent.indexOf("android") > -1 || 
        (userAgent.indexOf("linux") > -1 && userAgent.indexOf("mobile") > -1);
      
      console.log("Android detection - User Agent:", userAgent);
      console.log("Android detection result:", isAndroidDevice);
      
      setIsAndroid(isAndroidDevice);
    };

    detectAndroid();
  }, []);

  return isAndroid;
}

// Export content URL for image sequence
export const ANDROID_IMAGE_SEQUENCE_BASE_URL = "https://images.ctfassets.net/ns3lrpq3pt35/3FDaNx4G4DZxBPhp9auDjb/5c35986d5935723a17edc4a2853430b8";

// Test URL for a single frame
export const ANDROID_TEST_IMAGE_URL = "https://images.ctfassets.net/ns3lrpq3pt35/4PvWRZ9PXoEbCFHtHd0n4o/5918c4120ef20f5824def98f1659a0d3/LS_HeroSequence050.jpg";
