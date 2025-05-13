
import React from 'react';

interface ScrollJackNavigationProps {
  sectionCount: number;
  activeSection: number;
  onSectionChange: (sectionIndex: number) => void;
}

export const ScrollJackNavigation: React.FC<ScrollJackNavigationProps> = ({
  sectionCount,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-3">
        {Array.from({ length: sectionCount }).map((_, index) => (
          <button
            key={`nav-dot-${index}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index 
                ? 'bg-coral scale-125' 
                : 'bg-white opacity-70 hover:opacity-100'
            }`}
            onClick={() => onSectionChange(index)}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
