
import * as React from "react";

export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState<boolean>(false);

  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  return isIOS;
}
