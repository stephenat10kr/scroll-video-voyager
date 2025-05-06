
import React from "react";
import Logo from "./Logo";
const HeroText: React.FC = () => {
  return <div className="relative w-full z-10 bg-transparent">
      <div className="w-full max-w-none">
        {/* Section 1 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5">
                <h2 className="text-2xl md:text-2xl text-white font-medium mb-4">WELCOME TO</h2>
                <div className="w-[144px] md:w-[192px] lg:w-[240px] transform scale-[3] origin-top-left">
                  <Logo />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5">
                <h2 className="text-2xl md:text-2xl text-white font-medium mb-4">WHERE</h2>
                <h1 className="text-7xl text-white font-gt-super mb-6">curiosity</h1>
              </div>

              <div className="col-span-8 lg:col-span-8"></div>
              <div className="col-span-4 lg:col-span-4">
                <p className="text-base md:text-lg text-white">
                  isn't just welcomed—it's required. We follow questions more than answers, and see exploration as a form of devotion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5">
                <h2 className="text-2xl md:text-2xl text-white font-medium mb-4">MEETS</h2>
                <h1 className="text-7xl text-white font-gt-super mb-6">culture</h1>
              </div>
              
              <div className="col-span-8 lg:col-span-8"></div>
              <div className="col-span-4 lg:col-span-4">
                <p className="text-base md:text-lg text-white">
                  Gatherings become generators. Through shared rituals, art, sound, and space, we create the atmosphere that shapes the experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroText;
