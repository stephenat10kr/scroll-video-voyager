
import React, { useEffect } from 'react';
import ImageSequenceScrubber from '@/components/ImageSequenceScrubber';

const ImageSequencePage = () => {
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
    <div className="min-h-screen relative">
      {/* Make the container sticky */}
      <div className="sticky top-0 left-0 w-full h-screen z-10">
        <ImageSequenceScrubber />
      </div>
      
      {/* Content that scrolls underneath */}
      <div className="relative z-0">
        {/* Example content sections */}
        <section className="min-h-screen bg-opacity-80 bg-darkGreen flex items-center justify-center">
          <h2 className="title-lg text-white">First Section</h2>
        </section>
        
        <section className="min-h-screen bg-opacity-80 bg-darkGreen flex items-center justify-center">
          <h2 className="title-lg text-white">Second Section</h2>
        </section>
        
        <section className="min-h-screen bg-opacity-80 bg-darkGreen flex items-center justify-center">
          <h2 className="title-lg text-white">Third Section</h2>
        </section>
      </div>
    </div>
  );
};

export default ImageSequencePage;
