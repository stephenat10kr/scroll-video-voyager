
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

const SingleImage = () => {
  const [imageSrc, setImageSrc] = useState('/Image Sequence/0001.webp');
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("Mobile detection:", isMobile);
    
    // Try different path formats based on device
    const pathsToTry = isMobile ? [
      'Image Sequence/0001.webp',  // No leading slash for mobile
      './Image Sequence/0001.webp',
      'Image%20Sequence/0001.webp',
      `${window.location.origin}/Image Sequence/0001.webp`,
    ] : [
      '/Image Sequence/0001.webp',
      '/Image%20Sequence/0001.webp',
    ];
    
    // Function to test image paths
    const testImagePath = (index = 0) => {
      if (index >= pathsToTry.length) {
        console.log("All paths failed");
        return;
      }
      
      const path = pathsToTry[index];
      console.log(`Testing path: ${path}`);
      
      const img = new Image();
      img.onload = () => {
        console.log(`Path worked: ${path}`);
        setImageSrc(path);
        setIsLoaded(true);
        toast({
          title: "Image loaded",
          description: `Using path: ${path}`
        });
      };
      
      img.onerror = () => {
        console.log(`Path failed: ${path}`);
        // Try next path
        testImagePath(index + 1);
      };
      
      img.src = path;
    };
    
    // Start testing paths
    testImagePath();
  }, [isMobile]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {!isLoaded && (
          <div className="text-white text-center p-4">
            <p>Loading image...</p>
            <p className="text-xs mt-2 text-gray-400">Path: {imageSrc}</p>
          </div>
        )}
        
        <img
          src={imageSrc}
          alt="Single Image"
          className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            objectFit: 'contain',
            maxHeight: '100vh',
            transition: 'opacity 0.3s'
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => console.log(`Failed to load image: ${imageSrc}`)}
        />
        
        {/* Debug info */}
        <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 p-2 rounded">
          Mobile: {isMobile ? 'Yes' : 'No'}<br/>
          Path: {imageSrc}<br/>
          Loaded: {isLoaded ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

export default SingleImage;
