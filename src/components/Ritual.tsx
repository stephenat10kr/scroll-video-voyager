
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
  return <div className="grid grid-cols-12 gap-8 mb-16 last:mb-48">
      {/* Image Section - Always on left (cols 1-5) */}
      <div className="col-span-12 md:col-span-5 md:col-start-1">
        <AspectRatio ratio={1 / 1} className="mb-4 md:mb-0 rounded-lg overflow-hidden w-full">
          <div className="w-full h-full relative">
            {/* SVG Mask definition with gradient */}
            <svg width="0" height="0" className="absolute">
              <defs>
                {/* Gold Gradient Definition */}
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFDFC5" />
                  <stop offset="50%" stopColor="#FFF5E3" />
                  <stop offset="100%" stopColor="#D18F57" />
                </linearGradient>
                <clipPath id="starMask" clipPathUnits="objectBoundingBox">
                  <path d="M0.897 0.363L0.784 0.318C0.734 0.305 0.69 0.272 0.667 0.232C0.662 0.223 0.657 0.214 0.654 0.204L0.626 0.094C0.613 0.04 0.553 0.003 0.5 0.003C0.446 0.003 0.386 0.04 0.373 0.094L0.344 0.204C0.341 0.214 0.337 0.223 0.332 0.232C0.309 0.272 0.265 0.305 0.215 0.318L0.102 0.363C0.03 0.39 0.001 0.441 0.001 0.497C0.001 0.563 0.032 0.604 0.101 0.635L0.225 0.677C0.258 0.685 0.29 0.702 0.311 0.726C0.324 0.74 0.334 0.757 0.339 0.776L0.373 0.906C0.386 0.96 0.446 0.997 0.5 0.997C0.553 0.997 0.613 0.96 0.626 0.906L0.66 0.776C0.664 0.763 0.669 0.751 0.676 0.741C0.697 0.709 0.734 0.686 0.774 0.677L0.898 0.635C0.967 0.604 0.998 0.563 0.998 0.497C0.998 0.441 0.969 0.39 0.897 0.363Z" />
                </clipPath>
              </defs>
            </svg>
            
            {/* Star-shaped container with 2px padding */}
            <div className="absolute inset-2 z-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M89.7 36.3L78.4 31.8C73.4 30.5 69 27.2 66.7 23.2C66.2 22.3 65.7 21.4 65.4 20.4L62.6 9.4C61.3 4 55.3 0.3 50 0.3C44.6 0.3 38.6 4 37.3 9.4L34.4 20.4C34.1 21.4 33.7 22.3 33.2 23.2C30.9 27.2 26.5 30.5 21.5 31.8L10.2 36.3C3 39 0.1 44.1 0.1 49.7C0.1 56.3 3.2 60.4 10.1 63.5L22.5 67.7C25.8 68.5 29 70.2 31.1 72.6C32.4 74 33.4 75.7 33.9 77.6L37.3 90.6C38.6 96 44.6 99.7 50 99.7C55.3 99.7 61.3 96 62.6 90.6L66 77.6C66.4 76.3 66.9 75.1 67.6 74.1C69.7 70.9 73.4 68.6 77.4 67.7L89.8 63.5C96.7 60.4 99.8 56.3 99.8 49.7C99.8 44.1 96.9 39 89.7 36.3Z"
                  fill="none"
                  strokeWidth="1"
                  stroke="url(#goldGradient)"
                  style={{ strokeLinecap: "round", strokeLinejoin: "round", paintOrder: "stroke" }}
                  strokeDasharray="0"
                  paintOrder="stroke"
                />
              </svg>
            </div>
            
            {/* Image with star mask and 2px inset */}
            <div className="absolute inset-2">
              <img src={imageSrc} alt={imageAlt} className="object-cover w-full h-full" style={{
                clipPath: "url(#starMask)",
                WebkitClipPath: "url(#starMask)" // Adding browser prefix
              }} />
            </div>
          </div>
        </AspectRatio>
      </div>
      
      {/* Gap at columns 6-7 is created by the grid and gap-8 */}
      
      {/* Text Section - Always on right (cols 8-12) */}
      <div className="col-span-12 md:col-span-5 md:col-start-8 flex flex-col justify-center">
        <h2 className="title-md mb-6" style={{
        color: colors.darkGreen
      }}>
          {title}
        </h2>
        <div className="space-y-4">
          {description.map((paragraph, idx) => <p key={idx} className="text-sm" style={{
          color: colors.darkGreen
        }}>
              {paragraph}
            </p>)}
        </div>
      </div>
    </div>;
};
export default Ritual;
