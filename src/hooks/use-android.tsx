
import * as React from "react";

export function useIsAndroid() {
  const [isAndroid, setIsAndroid] = React.useState<boolean>(false);

  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = userAgent.indexOf("android") > -1;
    console.log("useIsAndroid - User agent:", userAgent);
    console.log("useIsAndroid - Is Android device:", isAndroidDevice);
    setIsAndroid(isAndroidDevice);
  }, []);

  return isAndroid;
}
