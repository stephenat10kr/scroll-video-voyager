
import React, { useState } from 'react';

const SingleImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imagePath = "/Image Sequence/0001.webp";

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        <img
          src={imagePath}
          alt="Single frame"
          className="w-full h-full object-contain"
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease"
          }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleImage;
