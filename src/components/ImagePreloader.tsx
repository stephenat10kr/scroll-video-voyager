
import React from 'react';

interface ImagePreloaderProps {
  currentFrame: number;
  getImagePath: (frame: number) => string;
  totalFrames: number;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  currentFrame,
  getImagePath,
  totalFrames,
}) => {
  const createPreloadImages = () => {
    const preloadFrames = [];
    for (let i = -1; i <= 3; i++) {
      if (i === 0) continue;
      
      const frameNum = currentFrame + i;
      if (frameNum >= 1 && frameNum <= totalFrames) {
        preloadFrames.push(
          <img 
            key={`preload-${frameNum}`}
            src={getImagePath(frameNum)}
            alt=""
            className="hidden"
            aria-hidden="true"
          />
        );
      }
    }
    return preloadFrames;
  };

  return (
    <div aria-hidden="true" className="sr-only">
      {createPreloadImages()}
    </div>
  );
};
