
import React from 'react';

interface NavigationDotsProps {
  sectionCount: number;
  activeSection: number;
  onSectionChange: (index: number) => void;
}

const NavigationDots: React.FC<NavigationDotsProps> = ({ 
  sectionCount, 
  activeSection, 
  onSectionChange 
}) => {
  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
      {Array.from({ length: sectionCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSectionChange(index)}
          className={`w-3 h-3 rounded-full ${
            index === activeSection ? 'bg-white' : 'bg-gray-500'
          }`}
          aria-label={`Go to section ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default NavigationDots;
