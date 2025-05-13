
import React from 'react';
import { gsap } from 'gsap';
import colors from "@/lib/theme";

interface ScrollIndicatorProps {
  currentSection: number;
  totalSections: number;
  isActive: boolean;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  currentSection, 
  totalSections,
  isActive
}) => {
  // Reference for animations
  const indicatorRef = React.useRef<HTMLDivElement>(null);
  
  // Animate on active changes
  React.useEffect(() => {
    if (!indicatorRef.current || !isActive) return;
    
    gsap.from(indicatorRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      ref={indicatorRef}
      className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center space-y-3 z-50"
      style={{ pointerEvents: 'none' }}
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <div 
          key={index}
          className="transition-all duration-300 ease-in-out"
          style={{
            width: currentSection === index ? '10px' : '6px',
            height: currentSection === index ? '10px' : '6px',
            borderRadius: '50%',
            backgroundColor: currentSection === index ? colors.coral : `${colors.roseWhite}80`,
            transform: currentSection === index ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
};

export default ScrollIndicator;
