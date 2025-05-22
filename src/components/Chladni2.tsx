
import React from 'react';

interface Chladni2Props {
  className?: string;
}

const Chladni2: React.FC<Chladni2Props> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`} style={{ zIndex: 15 }}>
      {/* Spacer div - 600vh height */}
      <div 
        className="w-full" 
        style={{ 
          height: '600vh', 
        }}
      />
      
      {/* Red box - 1200vh height */}
      <div 
        className="w-full" 
        style={{ 
          height: '1200vh',
          backgroundColor: 'red', 
        }}
      />
    </div>
  );
};

export default Chladni2;
