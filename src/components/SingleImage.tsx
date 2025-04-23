
import React from 'react';

const SingleImage = () => {
  // Use the most direct path possible with no fancy handling
  const imagePath = '/Image Sequence/0001.webp';
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        <img
          src={imagePath}
          alt="Single Image"
          className="w-full h-full"
          style={{ 
            objectFit: 'contain', // Ensure image is fully visible on mobile
            maxHeight: '100vh'
          }}
        />
      </div>
    </div>
  );
};

export default SingleImage;
