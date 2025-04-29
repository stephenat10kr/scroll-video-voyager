
import React from "react";
import { AspectRatio } from "./ui/aspect-ratio";

interface RitualReversedProps {
  title: string;
  description: string[];
  imageSrc: string;
  imageAlt: string;
}

const RitualReversed: React.FC<RitualReversedProps> = ({
  title,
  description,
  imageSrc,
  imageAlt
}) => {
  return (
    <div className="grid grid-cols-12 gap-8 mb-16 last:mb-0">
      {/* Text Section - Always on left (cols 1-5) */}
      <div className="col-span-12 md:col-span-5 md:col-start-1 flex flex-col justify-center">
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
      
      {/* Gap at columns 6-7 is created by the grid and gap-8 */}
      
      {/* Image Section - Always on right (cols 8-12) */}
      <div className="col-span-12 md:col-span-5 md:col-start-8">
        <AspectRatio ratio={1/1} className="mb-4 md:mb-0">
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>
    </div>
  );
};

export default RitualReversed;
