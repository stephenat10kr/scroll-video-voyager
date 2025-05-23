
import React, { useEffect } from 'react';
import SimpleImageSequence from '../components/SimpleImageSequence';

const ImgSeqPage = () => {
  // Add content to make the page scrollable for the image sequence
  useEffect(() => {
    document.body.style.height = '500vh'; // Make body 5x viewport height
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
    
    return () => {
      document.body.style.height = ''; // Reset on unmount
      document.body.style.overflow = ''; // Reset overflow
    };
  }, []);
  
  return (
    <div className="relative min-h-screen">
      {/* Sticky container for image sequence */}
      <div className="sticky top-0 left-0 w-full h-screen z-10 flex items-center justify-center">
        <SimpleImageSequence />
      </div>
    </div>
  );
};

export default ImgSeqPage;
