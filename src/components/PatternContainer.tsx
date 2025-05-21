
import React from 'react';
import ChladniPattern from './ChladniPattern';
import colors from '@/lib/theme';

const PatternContainer: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 w-full h-screen" 
      style={{ 
        zIndex: 15, // Above video (10) but below content (20)
        backgroundColor: colors.darkGreen, // Explicitly set background color
      }}
    >
      <ChladniPattern />
    </div>
  );
};

export default PatternContainer;
