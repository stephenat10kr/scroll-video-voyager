
import React, { useEffect, useRef, useState, Children } from 'react';
import { ScrollJackTitle } from './scroll-jack-title';
import { ScrollJackNavigation } from './scroll-jack-navigation';
import { useScrollJack } from './use-scroll-jack';

interface ScrollJackContainerProps {
  children: React.ReactNode;
  titles: string[];
}

export const ScrollJackContainer: React.FC<ScrollJackContainerProps> = ({ 
  children, 
  titles 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sections = Children.toArray(children);
  
  const { 
    activeSection, 
    previousSection, 
    animationDirection, 
    hasReachedEnd,
    handleSectionChange,
    handleWheelEvent
  } = useScrollJack({
    sectionCount: sections.length,
    containerRef
  });

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      onWheel={handleWheelEvent}
    >
      {/* Animated section titles */}
      <ScrollJackTitle 
        titles={titles}
        activeSection={activeSection}
        previousSection={previousSection}
        animationDirection={animationDirection}
      />

      {/* Section navigation dots */}
      <ScrollJackNavigation
        sectionCount={sections.length}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Sections container */}
      <div className="relative h-full w-full">
        {sections.map((section, index) => (
          <div
            key={`section-${index}`}
            className="absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out flex items-center justify-center"
            style={{
              transform: `translateY(${(index - activeSection) * 100}%)`,
              zIndex: index === activeSection ? 10 : 0,
              opacity: 1,
              pointerEvents: hasReachedEnd && index < activeSection ? 'none' : 'auto'
            }}
          >
            {React.isValidElement(section) ? 
              React.cloneElement(section, {
                ...section.props,
                className: `${section.props.className || ''} flex items-center justify-center h-full w-full`,
              } as React.HTMLAttributes<HTMLElement>) : section}
          </div>
        ))}
      </div>
    </div>
  );
};
