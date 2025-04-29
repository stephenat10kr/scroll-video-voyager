
import React from "react";
import { AspectRatio } from "./ui/aspect-ratio";

interface RitualProps {
  title: string;
  description: string[];
  imageSrc: string;
  imageAlt: string;
  isReversed?: boolean;
}

const Ritual: React.FC<RitualProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  isReversed = false
}) => {
  return (
    <div className="grid grid-cols-12 gap-8 mb-16 last:mb-0">
      {/* Image Section - Always spans cols 1-5 when not reversed, cols 8-12 when reversed */}
      <div className={`col-span-12 md:col-span-5 ${isReversed ? 'md:col-start-8' : 'md:col-start-1'}`}>
        <AspectRatio ratio={1/1} className="mb-4 md:mb-0">
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>
      
      {/* Text Section - Always spans cols 8-12 when not reversed, cols 1-5 when reversed */}
      <div className={`col-span-12 md:col-span-5 flex flex-col justify-center ${isReversed ? 'md:col-start-1' : 'md:col-start-8'}`}>
        <h2 className="text-7xl font-gt-super leading-none mb-6 text-white">
          {title}
        </h2>
        <div className="space-y-4">
          {description.map((paragraph, idx) => (
            <p key={idx} className="text-white text-xl">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ritual;
