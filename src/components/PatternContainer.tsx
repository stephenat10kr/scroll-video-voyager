
import React from 'react';
import ChladniPattern from './ChladniPattern';
import colors from '@/lib/theme';

const PatternContainer: React.FC = () => {
  return (
    <div 
      className="fixed w-full" 
      style={{ 
        zIndex: 15, // Above video (10) but below content (20)
        top: 0, // Position at top of page
        backgroundColor: colors.darkGreen, // Explicitly set background color
      }}
    >
      {/* Empty spacer div that is 600vh high */}
      <div className="w-full" style={{ height: '600vh', backgroundColor: colors.darkGreen }} />
      
      {/* ChladniPattern rendered at the bottom of the container */}
      <ChladniPattern />
    </div>
  );
};

export default PatternContainer;
