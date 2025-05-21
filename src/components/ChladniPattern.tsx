
import React, { useRef } from 'react';
import { colors } from '../lib/theme';
import { useChladniPattern } from '../hooks/useChladniPattern';

interface ChladniPatternProps {
  children?: React.ReactNode;
}

const ChladniPattern: React.FC<ChladniPatternProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use the custom hook to handle WebGL operations
  useChladniPattern({
    container: containerRef,
    canvas: canvasRef
  });
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ 
        backgroundColor: colors.darkGreen,
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ 
          opacity: 0.8,
          backgroundColor: 'transparent'
        }}
      />
      {children}
    </div>
  );
};

export default ChladniPattern;
