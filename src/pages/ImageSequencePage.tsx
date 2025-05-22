
import React, { useEffect } from 'react';
import ImageSequenceScrubber from '@/components/ImageSequenceScrubber';

const ImageSequencePage = () => {
  // Add some content to make the page scrollable
  useEffect(() => {
    document.body.style.height = '500vh'; // Make body 5x viewport height
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
    
    return () => {
      document.body.style.height = ''; // Reset on unmount
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      <ImageSequenceScrubber />
      
      {/* Invisible content to enable scrolling */}
      <div style={{ height: '400vh' }} aria-hidden="true"></div>
    </div>
  );
};

export default ImageSequencePage;
