
import React from 'react';
import ChladniPattern from './ChladniPattern';

const PatternContainer: React.FC = () => {
  return (
    <div 
      className="fixed w-full" 
      style={{ 
        zIndex: 15, // Above video (10) but below content (20)
        top: 0, // Position at top of page
      }}
    >
      {/* Empty spacer div that is 600vh high */}
      <div className="w-full" style={{ height: '600vh' }} />
      
      {/* ChladniPattern rendered at the bottom of the container */}
      <ChladniPattern />
    </div>
  );
};

export default PatternContainer;
