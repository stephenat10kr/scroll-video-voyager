
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

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
      <div>Current Frame: {currentFrame}</div>
      <div>Path Format Index: {typeof workingPathFormat === 'function' ? '✓' : '✗'}</div>
      <div>Status: {imageLoaded ? "Loaded ✅" : imageError ? "Error ❌" : "Loading..."}</div>
      <div>Device: {isMobile ? "Mobile 📱" : "Desktop 💻"}</div>
      <div>Origin: {window.location.origin}</div>
      <div>Pathname: {window.location.pathname}</div>
    </div>
  );
};
