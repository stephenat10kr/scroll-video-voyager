
import React from "react";
import Logo from "./Logo";

type ScrollVideoContentProps = {
  progress: number;
  containerRef: React.RefObject<HTMLDivElement>;
};

const ScrollVideoContent: React.FC<ScrollVideoContentProps> = ({ 
  progress, 
  containerRef 
}) => {
  // Calculate which section to show based on progress
  // The video is divided into 3 equal sections
  const section = Math.floor(progress * 3);
  const sectionProgress = (progress * 3) % 1;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div 
        className="absolute w-full grid grid-cols-12 gap-4 px-4 md:px-8 lg:px-12"
        style={{ 
          transform: `translateY(${-progress * 200}vh)`,
          height: '300vh' // 3x viewport height
        }}
      >
        {/* Section 1 */}
        <div className="col-span-12 h-screen flex flex-col justify-center">
          <div className="col-span-12 lg:col-span-5 lg:col-start-1">
            <h2 className="text-2xl md:text-3xl text-white font-medium mb-4">WELCOME TO</h2>
            <div className="w-48 md:w-64 lg:w-80">
              <Logo />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="col-span-12 h-screen flex flex-col justify-center">
          <div className="grid grid-cols-12 gap-4 w-full">
            <div className="col-span-12 lg:col-span-5 lg:col-start-1">
              <h2 className="text-2xl md:text-3xl text-white font-medium mb-4">WHERE</h2>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white font-gt-super mb-6">curiosity</h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-base md:text-lg text-white">
                isn't just welcomed—it's required. We follow questions more than answers, and see exploration as a form of devotion.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="col-span-12 h-screen flex flex-col justify-center">
          <div className="grid grid-cols-12 gap-4 w-full">
            <div className="col-span-12 lg:col-span-5 lg:col-start-1">
              <h2 className="text-2xl md:text-3xl text-white font-medium mb-4">MEETS</h2>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white font-gt-super mb-6">culture</h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-base md:text-lg text-white">
                Gatherings become generators. Through shared rituals, art, sound, and space, we create the atmosphere that shapes the experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollVideoContent;
