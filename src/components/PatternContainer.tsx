
import React from 'react';
import ChladniPattern from './ChladniPattern';
import colors from '@/lib/theme';

const PatternContainer: React.FC = () => {
  return (
    <div 
      className="relative w-full" 
      style={{ 
        zIndex: 15, // Above video (10) but below content (20)
        backgroundColor: colors.darkGreen, // Explicitly set background color
      }}
    >
      {/* Empty spacer div that is 600vh high */}
      <div className="w-full" style={{ height: '600vh', backgroundColor: colors.darkGreen }} />
      
      {/* ChladniPattern rendered after the spacer and will stick to viewport */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: colors.darkGreen }}>
        <ChladniPattern />
      </div>
    </div>
  );
};

export default PatternContainer;
