
import React from "react";
import { useDeviceDetection } from "../hooks/use-device-detection";

const VideoDebug: React.FC = () => {
  const { isMobile, isAndroid, isIOS, isFirefox } = useDeviceDetection();
  
  // Hide in production by uncommenting the next line
  // return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded-md text-xs z-50 max-w-[160px]">
      <div><strong>Device Debug:</strong></div>
      <div>Mobile: {isMobile ? "Yes" : "No"}</div>
      <div>Android: {isAndroid ? "Yes" : "No"}</div>
      <div>iOS: {isIOS ? "Yes" : "No"}</div>
      <div>Firefox: {isFirefox ? "Yes" : "No"}</div>
    </div>
  );
};

export default VideoDebug;
