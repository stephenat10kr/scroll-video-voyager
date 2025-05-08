
import React from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import colors from "@/lib/theme";

interface RitualProps {
  title: string;
  description: string[];
  imageSrc: string;
  imageAlt: string;
}

// This is now only for the standard layout (image left, text right)
const Ritual: React.FC<RitualProps> = ({
  title,
  description,
  imageSrc,
  imageAlt
}) => {
  return <div className="grid grid-cols-12 gap-8 mb-16 last:mb-24">
      {/* Image Section - Always on left (cols 1-5) */}
      <div className="col-span-12 md:col-span-5 md:col-start-1">
        <AspectRatio ratio={1 / 1} className="mb-4 md:mb-0 rounded-lg overflow-hidden w-full">
          <img src={imageSrc} alt={imageAlt} className="object-cover w-full h-full" />
        </AspectRatio>
      </div>
      
      {/* Gap at columns 6-7 is created by the grid and gap-8 */}
      
      {/* Text Section - Always on right (cols 8-12) */}
      <div className="col-span-12 md:col-span-5 md:col-start-8 flex flex-col justify-center">
        <h2 className="title-md mb-6" style={{ color: colors.darkGreen }}>
          {title}
        </h2>
        <div className="space-y-4">
          {description.map((paragraph, idx) => <p key={idx} className="text-sm" style={{ color: colors.darkGreen }}>
              {paragraph}
            </p>)}
        </div>
      </div>
    </div>;
};
export default Ritual;
