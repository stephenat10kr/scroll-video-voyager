
import React from 'react';
import { useScrollJack } from './scroll-jack/use-scroll-jack';
import NavigationDots from './scroll-jack/NavigationDots';
import ScrollJackTitle from './scroll-jack/ScrollJackTitle';
import { ScrollJackContainerProps } from './scroll-jack/types';

const ScrollJackContainer: React.FC<ScrollJackContainerProps> = ({ children, titles }) => {
  const {
    containerRef,
    activeSection,
    previousSection,
    animationDirection,
    sectionCount,
    sectionTitles,
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
      
      {/* Render sections with appropriate visibility */}
      <div className="h-screen overflow-hidden relative">
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return null;
          
          const isActive = index === activeSection;
          const isPrevious = index === previousSection;
          
          // Apply different classes based on section state
          let sectionClasses = 
            'absolute top-0 left-0 w-full h-screen transition-opacity duration-700 ease-in-out';
          
          if (isActive) {
            sectionClasses += ' opacity-100 z-20';
          } else if (isPrevious) {
            sectionClasses += ' opacity-0 z-10';
          } else {
            sectionClasses += ' opacity-0 z-0';
          }
          
          return (
            <div key={`section-${index}`} className={sectionClasses}>
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollJackContainer;
