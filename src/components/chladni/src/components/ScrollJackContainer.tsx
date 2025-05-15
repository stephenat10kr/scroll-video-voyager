
import React, { useEffect } from 'react';
import { useScrollJack } from '../scroll-jack/use-scroll-jack';
import { createModifiedSection } from '../scroll-jack/utils';
import ScrollJackTitle from '../scroll-jack/ScrollJackTitle';
import NavigationDots from '../scroll-jack/NavigationDots';
import { ScrollJackContainerProps } from '../types';

const ScrollJackContainer: React.FC<ScrollJackContainerProps> = ({ children, titles }) => {
  const {
    containerRef,
    activeSection,
    previousSection,
    animationDirection,
    sectionCount,
    hasReachedEnd,
    setActiveSection,
    setPreviousSection,
    setAnimationDirection,
    setHasReachedEnd
  } = useScrollJack(children);

  const handleSectionChange = (index: number) => {
    setPreviousSection(activeSection);
    setAnimationDirection(index > activeSection ? 'up' : 'down');
    setActiveSection(index);
    setHasReachedEnd(index === sectionCount - 1);
  };

  // Reset scroll position when reaching end or beginning
  useEffect(() => {
    if (hasReachedEnd) {
      window.scrollTo(0, 0);
    }
  }, [hasReachedEnd]);
  
  // Use provided titles or default to section numbers
  const sectionTitles = titles || Array.from({ length: sectionCount }, (_, i) => `Section ${i + 1}`);
  
  return (
    <div 
      ref={containerRef} 
      className={`h-screen overflow-hidden relative ${hasReachedEnd ? 'static' : ''}`}
    >
      {/* Fixed title display component */}
      <ScrollJackTitle 
        titles={sectionTitles} 
        activeSection={activeSection}
        previousSection={previousSection}
        animationDirection={animationDirection}
      />
      
      {/* Render sections with proper vertical centering */}
      <div className={`absolute inset-0 ${hasReachedEnd ? 'pb-screen' : ''}`}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return createModifiedSection(child, index, activeSection, hasReachedEnd, sectionCount);
          }
          return child;
        })}
      </div>
      
      {/* Navigation dots component */}
      <NavigationDots 
        sectionCount={sectionCount} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
    </div>
  );
};

export default ScrollJackContainer;
