
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SequenceImageProps {
  currentFrame: number;
  getImagePath: (frame: number) => string;
  onLoad: () => void;
  onError: () => void;
  imageLoaded: boolean;
}

export const SequenceImage: React.FC<SequenceImageProps> = ({
  currentFrame,
  getImagePath,
  onLoad,
  onError,
  imageLoaded,
}) => {
  const isMobile = useIsMobile();
  
  // Mobile devices may need different styling
  const objectFit = isMobile ? "contain" : "cover";
  
  return (
    <>
      <img
        key={`frame-${currentFrame}`}
        src={getImagePath(currentFrame)}
        alt={`Frame ${currentFrame}`}
        className={`w-full h-full ${isMobile ? 'max-h-screen' : ''}`}
        style={{ 
          objectFit, 
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.2s ease"
        }}
        onLoad={onLoad}
        onError={onError}
        loading="eager"
      />
      
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </>
  );
};
