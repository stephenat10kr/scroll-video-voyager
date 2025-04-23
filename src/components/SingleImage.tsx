
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const SingleImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();
  
  // Try different image path formats that might work better on mobile
  const imagePaths = [
    "/Image Sequence/0001.webp",
    "Image Sequence/0001.webp",
    "./Image Sequence/0001.webp",
    "Image-Sequence/0001.webp",
  ];
  
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const currentPath = imagePaths[currentPathIndex];
  
  useEffect(() => {
    console.log(`Attempting to load image from path: ${currentPath}`);
  }, [currentPath]);
  
  const handleImageError = () => {
    console.error(`Failed to load image from path: ${currentPath}`);
    // Try the next path format
    if (currentPathIndex < imagePaths.length - 1) {
      setCurrentPathIndex(prevIndex => prevIndex + 1);
    } else {
      setImageError(true);
    }
  };
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {!imageError && (
          <img
            key={currentPath} // Key to force re-render on path change
            src={currentPath}
            alt="Single frame"
            className="w-full h-full object-contain"
            style={{ 
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.2s ease"
            }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
            <p className="mb-4">Unable to load the image.</p>
            <button 
              className="px-4 py-2 bg-white text-black rounded-md"
              onClick={() => {
                setImageError(false);
                setImageLoaded(false);
                setCurrentPathIndex(0);
              }}
            >
              Retry
            </button>
            
            {/* Debug info */}
            <div className="mt-6 text-xs opacity-70 max-w-xs">
              <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
              <p>Is Mobile: {isMobile ? "Yes" : "No"}</p>
              <p>Current Path: {currentPath}</p>
              <p>Path Index: {currentPathIndex + 1}/{imagePaths.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleImage;
