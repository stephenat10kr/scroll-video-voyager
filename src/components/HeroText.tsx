
import React from "react";
import Logo from "./Logo";
import { useIsMobile } from "../hooks/use-mobile";
import { useHeroText } from "../hooks/useHeroText";
import Spinner from "./Spinner";
import { AspectRatio } from "./ui/aspect-ratio";

interface HeroTextProps {
  skipLogoSection?: boolean;
}

const HeroText: React.FC<HeroTextProps> = ({ skipLogoSection = false }) => {
  const isMobile = useIsMobile();
  const {
    data: heroTextItems,
    isLoading,
    error
  } = useHeroText();

  const firstHeroText = heroTextItems?.find(item => item.fields.orderNumber === 1);
  const secondHeroText = heroTextItems?.find(item => item.fields.orderNumber === 2);
  
  if (isLoading) {
    return <div className="w-full flex items-center justify-center py-12">
        <Spinner />
      </div>;
  }
  
  if (error || !heroTextItems || heroTextItems.length < 2) {
    console.error('Error loading hero text data:', error);
    return <div className="w-full flex items-center justify-center py-12">
        <p className="text-roseWhite text-lg">Unable to load content. Please refresh the page.</p>
      </div>;
  }
  
  return (
    <div className="w-full bg-transparent h-[500vh]">
      {/* First section - Logo section (only show if not skipped) */}
      {!skipLogoSection && (
        <div className="flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20 min-h-screen">
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

      {/* Additional spacing to fill the 500vh height */}
      <div className="h-[300vh]"></div>
    </div>
  );
};

export default HeroText;
