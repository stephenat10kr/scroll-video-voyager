
import React from 'react';
import { useScrollJack } from './scroll-jack/use-scroll-jack';
import NavigationDots from './scroll-jack/NavigationDots';
import ScrollJackTitle from './scroll-jack/ScrollJackTitle';
import { ScrollJackContainerProps } from './scroll-jack/types';
import { createModifiedSection } from './scroll-jack/utils';

const ScrollJackContainer: React.FC<ScrollJackContainerProps> = ({ children, titles }) => {
  const {
    containerRef,
    activeSection,
    previousSection,
    animationDirection,
    sectionCount,
    sectionTitles,
    hasReachedEnd,
    isScrollJackActive,
    setActiveSection,
    setIsScrollJackActive,
    setAnimationDirection,
    setPreviousSection
  } = useScrollJack(children);

  // Enable scroll-jacking when component mounts
  React.useEffect(() => {
    setIsScrollJackActive(true);
    return () => {
      setIsScrollJackActive(false);
    };
  }, [setIsScrollJackActive]);

  // Convert children to array for manipulation
  const childrenArray = React.Children.toArray(children);

  // Handle navigation dot clicks
  const handleSectionChange = (index: number) => {
    // Set animation direction based on navigation
    if (index > activeSection) {
      setAnimationDirection('up');
    } else {
      setAnimationDirection('down');
    }
    
    // Store the previous section before changing
    setPreviousSection(activeSection);
    
    // Update active section
    setActiveSection(index);
  };

  // Custom titles if provided, otherwise use extracted ones
  const displayTitles = titles ? titles : sectionTitles;

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-darkGreen min-h-screen">
      {/* Fixed title element that changes based on active section */}
      <ScrollJackTitle 
        titles={displayTitles} 
        activeSection={activeSection}
        previousSection={previousSection}
        animationDirection={animationDirection}
      />
      
      {/* Navigation dots */}
      <NavigationDots 
        sectionCount={sectionCount}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Render sections using the new createModifiedSection utility */}
      <div className="h-screen overflow-hidden relative">
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return null;
          
          return createModifiedSection(
            child,
            index,
            activeSection,
            hasReachedEnd,
            sectionCount
          );
        })}
      </div>
    </div>
  );
};

export default ScrollJackContainer;
