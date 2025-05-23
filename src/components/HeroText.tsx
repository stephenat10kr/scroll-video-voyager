
import React, { useRef } from "react";
import Logo from "./Logo";
import { useIsMobile } from "../hooks/use-mobile";
import { useHeroText } from "../hooks/useHeroText";
import { AspectRatio } from "./ui/aspect-ratio";
import { useIsAndroid } from "../hooks/use-android";
import { useIsIOS } from "../hooks/useIsIOS";

interface HeroTextProps {
  skipLogoSection?: boolean;
}

const HeroText: React.FC<HeroTextProps> = ({ skipLogoSection = false }) => {
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  const {
    data: heroTextItems,
    isLoading,
    error
  } = useHeroText();

  const firstHeroText = heroTextItems?.find(item => item.fields.orderNumber === 1);
  const secondHeroText = heroTextItems?.find(item => item.fields.orderNumber === 2);
  
  // Determine container height based on device type
  const getContainerHeight = () => {
    if (isAndroid) return 'h-[300vh]'; // 3 screen heights
    if (isIOS) return 'h-[450vh]';    // 4.5 screen heights
    return 'h-[450vh]';               // 4.5 screen heights for desktop (changed from 500vh)
  };
  
  if (isLoading) {
    return <div className="w-full flex items-center justify-center py-12">
        <p className="text-roseWhite text-lg">Loading...</p>
      </div>;
  }
  
  if (error || !heroTextItems || heroTextItems.length < 2) {
    console.error('Error loading hero text data:', error);
    return <div className="w-full flex items-center justify-center py-12">
        <p className="text-roseWhite text-lg">Unable to load content. Please refresh the page.</p>
      </div>;
  }
  
  return (
    <div className={`w-full bg-transparent ${getContainerHeight()}`}>
      {/* First section - Logo section (only show if not skipped) */}
      {!skipLogoSection && (
        <div className="h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="flex flex-col items-center">
              <h2 className="title-sm text-roseWhite mb-0 text-center py-0">WELCOME TO</h2>
              <div className="flex justify-center items-center mt-12 w-full">
                <div className="w-[320px] md:w-[420px] lg:w-[520px] mx-auto">
                  <AspectRatio ratio={444/213} className="w-full">
                    <Logo />
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Second section - First hero text */}
      <div className="h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-[90%] mx-auto">
          <div className="py-12">
            <h2 className="title-sm text-roseWhite mb-4 text-center">{firstHeroText.fields.heroTextEyebrow}</h2>
            <h1 className="title-xl text-roseWhite mb-6 text-center">{firstHeroText.fields.heroTextTitle}</h1>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <p className={`body-text text-roseWhite ${isMobile ? 'col-start-4 col-span-8' : 'col-start-9 col-span-4'}`}>
              {firstHeroText.fields.heroTextText}
            </p>
          </div>
        </div>
      </div>

      {/* Third section - Second hero text */}
      <div className="h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-[90%] mx-auto">
          <div className="py-12">
            <h2 className="title-sm text-roseWhite mb-4 text-center">{secondHeroText.fields.heroTextEyebrow}</h2>
            <h1 className="title-xl text-roseWhite mb-6 text-center">{secondHeroText.fields.heroTextTitle}</h1>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <p className={`body-text text-roseWhite ${isMobile ? 'col-start-4 col-span-8' : 'col-start-9 col-span-4'}`}>
              {secondHeroText.fields.heroTextText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroText;
