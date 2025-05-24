
import * as React from "react";

export function useIsAndroid() {
  const [isAndroid, setIsAndroid] = React.useState<boolean>(false);

  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = userAgent.indexOf("android") > -1;
    setIsAndroid(isAndroidDevice);
  }, []);

  return isAndroid;
}
