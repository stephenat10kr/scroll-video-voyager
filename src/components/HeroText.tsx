import React from "react";
import Logo from "./Logo";
import { useIsMobile } from "../hooks/use-mobile";
const HeroText: React.FC = () => {
  return <div className="relative w-full z-10 bg-transparent overflow-x-hidden">
      <div className="w-full max-w-none">
        {/* Section 1 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12 py-[240px]">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5 flex flex-col items-center">
                <h2 className="title-sm text-white mb-0 text-center py-[18px]">WELCOME TO</h2>
                <div className="flex justify-center items-center mt-12">
                  <div className="w-[144px] md:w-[192px] lg:w-[240px] transform scale-[3] origin-center">
                    <Logo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5 py-[240px]">
                <h2 className="title-sm text-white mb-4 text-center">WHERE</h2>
                <h1 className="title-lg text-white mb-6 text-center">curiosity</h1>
              </div>
              
              <div className="col-span-4 md:col-span-8"></div>
              <p className="body-text text-white col-span-8 md:col-span-4">
                isn't just welcomed—it's required. We follow questions more than answers, and see exploration as a form of devotion.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5 py-[240px]">
                <h2 className="title-sm text-white mb-4 text-center">MEETS</h2>
                <h1 className="title-lg text-white mb-6 text-center">culture</h1>
              </div>
              
              <div className="col-span-4 md:col-span-8"></div>
              <p className="body-text text-white col-span-8 md:col-span-4">
                Gatherings become generators. Through shared rituals, art, sound, and space, we create the atmosphere that shapes the experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroText;