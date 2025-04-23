
import React, { useState } from 'react';
import { ImageError } from './ImageError';
import { ImageDebugInfo } from './ImageDebugInfo';
import { useIsMobile } from '@/hooks/use-mobile';
import { SequenceImage } from './SequenceImage';

const SingleImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();
  
  // Define our image path formats to try
  const pathFormats = [
    (frame: number) => `/Image Sequence/${frame.toString().padStart(4, '0')}.webp`,
    (frame: number) => `Image Sequence/${frame.toString().padStart(4, '0')}.webp`,
    (frame: number) => `./Image Sequence/${frame.toString().padStart(4, '0')}.webp`,
    // Add any other path formats you want to try
  ];
  
  // Start with the first path format
  const [currentFormatIndex, setCurrentFormatIndex] = useState(0);
  const currentPathFormat = currentFormatIndex < pathFormats.length ? pathFormats[currentFormatIndex] : null;
  
  // Use a fixed frame (1) for the single image
  const currentFrame = 1;
  
  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Handle image load error
  const handleImageError = () => {
    console.error(`Failed to load image using format at index ${currentFormatIndex}`);
    // Try the next path format
    if (currentFormatIndex < pathFormats.length - 1) {
      setCurrentFormatIndex(prevIndex => prevIndex + 1);
    } else {
      setImageError(true);
    }
  };
  
  // Reset the image loading attempt
  const resetImageLoading = () => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentFormatIndex(0);
  };
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {!imageError && currentPathFormat && (
          <SequenceImage 
            currentFrame={currentFrame}
            getImagePath={currentPathFormat}
            onLoad={handleImageLoad}
            onError={handleImageError}
            imageLoaded={imageLoaded}
          />
        )}
        
        {imageError && (
          <ImageError 
            message="Unable to load the image. Please check your internet connection and try again."
            onRefresh={resetImageLoading}
          />
        )}
        
        <ImageDebugInfo 
          currentFrame={currentFrame}
          workingPathFormat={currentPathFormat}
          imageLoaded={imageLoaded}
          imageError={imageError}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default SingleImage;
