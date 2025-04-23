
import React from 'react';

interface ImageDebugInfoProps {
  currentFrame: number;
  workingPathFormat: ((frame: number) => string) | null;
  imageLoaded: boolean;
  imageError: boolean;
  isMobile?: boolean;
}

export const ImageDebugInfo: React.FC<ImageDebugInfoProps> = ({
  currentFrame,
  workingPathFormat,
  imageLoaded,
  imageError,
  isMobile,
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  // Get the actual path that would be used
  const samplePath = workingPathFormat ? workingPathFormat(currentFrame) : 'No path format available';

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs overflow-auto">
      <div>Current Frame: {currentFrame}</div>
      <div>Path Format: {typeof workingPathFormat === 'function' ? '✓' : '✗'}</div>
      <div>Sample Path: {samplePath}</div>
      <div>Status: {imageLoaded ? "Loaded ✅" : imageError ? "Error ❌" : "Loading..."}</div>
      <div>Device: {isMobile ? "Mobile 📱" : "Desktop 💻"}</div>
      <div>Origin: {window.location.origin}</div>
      <div>Pathname: {window.location.pathname}</div>
      <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
    </div>
  );
};
