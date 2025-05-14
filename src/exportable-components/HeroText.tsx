
import React from "react";
import Logo from "./Logo";
import { useIsMobile } from "./use-mobile";
import { useHeroText } from "./useHeroText";
import Spinner from "./Spinner";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

const HeroText: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    data: heroTextItems,
    isLoading,
    error
  } = useHeroText();

  // Get the first and second hero text items if available
  const firstHeroText = heroTextItems?.find(item => item.fields.orderNumber === 1);
  const secondHeroText = heroTextItems?.find(item => item.fields.orderNumber === 2);

  if (isLoading) {
    return <div className="relative w-full z-10 bg-transparent min-h-screen flex items-center justify-center">
        <Spinner />
      </div>;
  }
  if (error || !heroTextItems || heroTextItems.length < 2) {
    console.error('Error loading hero text data:', error);
    return <div className="relative w-full z-10 bg-transparent min-h-screen flex items-center justify-center">
        <p className="text-white text-lg">Unable to load content. Please refresh the page.</p>
      </div>;
  }
  return <div className="relative w-full z-10 bg-transparent overflow-x-hidden">
      <div className="w-full max-w-none">
        {/* Section 1 - Logo section with hardcoded "WELCOME TO" */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="col-span-12 lg:col-span-5 flex flex-col items-center">
              <h2 className="title-sm text-white mb-0 text-center py-0">WELCOME TO</h2>
              <div className="flex justify-center items-center mt-12 w-full">
                {/* Using fixed width with proper aspect ratio to ensure consistent display across browsers */}
                <div className="w-[320px] md:w-[420px] lg:w-[520px] mx-auto">
                  <AspectRatio ratio={444/213} className="w-full">
                    <Logo />
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 - First hero text (orderNumber: 1) */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="col-span-12 lg:col-span-5 py-[240px]">
              <h2 className="title-sm text-white mb-4 text-center">{firstHeroText.fields.heroTextEyebrow}</h2>
              <h1 className="title-lg text-white mb-6 text-center">{firstHeroText.fields.heroTextTitle}</h1>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              <p className={`body-text text-white ${isMobile ? 'col-start-4 col-span-8' : 'col-start-9 col-span-4'}`}>
                {firstHeroText.fields.heroTextText}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 - Second hero text (orderNumber: 2) */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="py-[240px]">
              <h2 className="title-sm text-white mb-4 text-center">{secondHeroText.fields.heroTextEyebrow}</h2>
              <h1 className="title-lg text-white mb-6 text-center">{secondHeroText.fields.heroTextTitle}</h1>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              <p className={`body-text text-white ${isMobile ? 'col-start-4 col-span-8' : 'col-start-9 col-span-4'}`}>
                {secondHeroText.fields.heroTextText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroText;
