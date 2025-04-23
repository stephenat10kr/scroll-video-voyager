
import React from 'react';

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
  return (
    <>
      <img
        key={`frame-${currentFrame}`}
        src={getImagePath(currentFrame)}
        alt={`Frame ${currentFrame}`}
        className="w-full h-full object-cover"
        onLoad={onLoad}
        onError={onError}
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />
      
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </>
  );
};
