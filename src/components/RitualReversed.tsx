import React, { useEffect, useRef } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import colors from "@/lib/theme";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const imageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const imageContainer = imageRef.current;
    if (!imageContainer) return;
    const handleParallax = () => {
      const scrollPosition = window.scrollY;
      const containerRect = imageContainer.getBoundingClientRect();
      const containerTop = containerRect.top + scrollPosition;
      const containerBottom = containerTop + containerRect.height;

      // Only apply parallax when element is in viewport
      if (scrollPosition + window.innerHeight >= containerTop && scrollPosition <= containerBottom) {
        // Calculate the relative position of the element in the viewport
        const relativePos = (scrollPosition + window.innerHeight - containerTop) / (window.innerHeight + containerRect.height);

        // Apply a more pronounced transform - move 100px up or down based on scroll position
        const translateY = (relativePos - 0.5) * 100; // 100px max movement
        imageContainer.style.transform = `translateY(${translateY}px)`;
      }
    };
    window.addEventListener('scroll', handleParallax);
    handleParallax(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  // For mobile view, use the same layout as the regular Ritual component
  if (isMobile) {
    return <div className="grid grid-cols-12 gap-8 mb-16 last:mb-0 relative" style={{
      zIndex: 10
    }}>
        {/* Image Section - Always on left on mobile (cols 1-12) */}
        <div className="col-span-12 md:col-span-5 md:col-start-1 relative" style={{
        zIndex: 20
      }}>
          <div ref={imageRef} className="transition-transform duration-300 ease-out relative" style={{
          zIndex: 30
        }}>
            <AspectRatio ratio={1 / 1} className="mb-4 md:mb-0 rounded-lg w-full">
              <div className="w-full h-full relative">
                {/* SVG Mask definition with gradient */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <clipPath id="starMaskMobile" clipPathUnits="objectBoundingBox">
                      <path d="M0.897 0.363L0.784 0.318C0.734 0.305 0.69 0.272 0.667 0.232C0.662 0.223 0.657 0.214 0.654 0.204L0.626 0.094C0.613 0.04 0.553 0.003 0.5 0.003C0.446 0.003 0.386 0.04 0.373 0.094L0.344 0.204C0.341 0.214 0.337 0.223 0.332 0.232C0.309 0.272 0.265 0.305 0.215 0.318L0.102 0.363C0.03 0.39 0.001 0.441 0.001 0.497C0.001 0.563 0.032 0.604 0.101 0.635L0.225 0.677C0.258 0.685 0.29 0.702 0.311 0.726C0.324 0.74 0.334 0.757 0.339 0.776L0.373 0.906C0.386 0.96 0.446 0.997 0.5 0.997C0.553 0.997 0.613 0.96 0.626 0.906L0.66 0.776C0.664 0.763 0.669 0.751 0.676 0.741C0.697 0.709 0.734 0.686 0.774 0.677L0.898 0.635C0.967 0.604 0.998 0.563 0.998 0.497C0.998 0.441 0.969 0.39 0.897 0.363Z" />
                    </clipPath>
                    {/* Define the gradient for the stroke */}
                    <linearGradient id="strokeGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFDFC5" />
                      <stop offset="50%" stopColor="#FFF5E3" />
                      <stop offset="100%" stopColor="#D18F57" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Image with mask */}
                <div className="w-full h-full" style={{
                clipPath: "url(#starMaskMobile)",
                WebkitClipPath: "url(#starMaskMobile)"
              }}>
                  <img src={imageSrc} alt={imageAlt} className="object-cover w-full h-full" />
                </div>
                
                {/* Standalone border SVG that sits on top */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M89.7 36.3L78.4 31.8C73.4 30.5 69.0 27.2 66.7 23.2C66.2 22.3 65.7 21.4 65.4 20.4L62.6 9.4C61.3 4.0 55.3 0.3 50.0 0.3C44.6 0.3 38.6 4.0 37.3 9.4L34.4 20.4C34.1 21.4 33.7 22.3 33.2 23.2C30.9 27.2 26.5 30.5 21.5 31.8L10.2 36.3C3.0 39.0 0.1 44.1 0.1 49.7C0.1 56.3 3.2 60.4 10.1 63.5L22.5 67.7C25.8 68.5 29.0 70.2 31.1 72.6C32.4 74.0 33.4 75.7 33.9 77.6L37.3 90.6C38.6 96.0 44.6 99.7 50.0 99.7C55.3 99.7 61.3 96.0 62.6 90.6L66.0 77.6C66.4 76.3 66.9 75.1 67.6 74.1C69.7 70.9 73.4 68.6 77.4 67.7L89.8 63.5C96.7 60.4 99.8 56.3 99.8 49.7C99.8 44.1 96.9 39.0 89.7 36.3Z" fill="none" stroke="url(#strokeGradientMobile)" strokeWidth="2" vectorEffect="non-scaling-stroke" transform="scale(0.998)" style={{
                  transformOrigin: 'center'
                }} />
                </svg>
              </div>
            </AspectRatio>
          </div>
        </div>
        
        {/* Text Section - Below image on mobile (cols 1-12) */}
        <div className="col-span-12 md:col-span-5 md:col-start-8 md:col-end-11 flex flex-col justify-center relative" style={{
        zIndex: 15
      }}>
          <h2 className="title-md mb-6 text-center md:text-left" style={{
          color: colors.darkGreen
        }}>
            {title}
          </h2>
          <div className="space-y-4">
            {description.map((paragraph, idx) => <p key={idx} className="body-text text-center md:text-left" style={{
            color: colors.darkGreen
          }}>
                {paragraph}
              </p>)}
          </div>
        </div>
      </div>;
  }

  // Desktop view - reversed layout (text left, image right)
  return <div className="grid grid-cols-12 gap-8 mb-16 last:mb-0 relative" style={{
    zIndex: 10
  }}>
      {/* Text Section - Always on left (cols 1-5) */}
      <div style={{
      zIndex: 15
    }} className="col-span-12 md:col-span-5 md:col-start-3 md:col-end-6 flex flex-col justify-center relative">
        <h2 className="title-md mb-6 text-center md:text-left" style={{
        color: colors.darkGreen
      }}>
          {title}
        </h2>
        <div className="space-y-4">
          {description.map((paragraph, idx) => <p key={idx} className="body-text text-center md:text-left" style={{
          color: colors.darkGreen
        }}>
              {paragraph}
            </p>)}
        </div>
      </div>
      
      {/* Gap at columns 6-7 is created by the grid and gap-8 */}
      
      {/* Image Section - Always on right (cols 8-12) */}
      <div className="col-span-12 md:col-span-5 md:col-start-8 relative" style={{
      zIndex: 20
    }}>
        <div ref={imageRef} className="transition-transform duration-300 ease-out relative" style={{
        zIndex: 30
      }}>
          <AspectRatio ratio={1 / 1} className="mb-4 md:mb-0 rounded-lg w-full">
            <div className="w-full h-full relative">
              {/* SVG Mask definition */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <clipPath id="starMaskReversed" clipPathUnits="objectBoundingBox">
                    <path d="M0.897 0.363L0.784 0.318C0.734 0.305 0.69 0.272 0.667 0.232C0.662 0.223 0.657 0.214 0.654 0.204L0.626 0.094C0.613 0.04 0.553 0.003 0.5 0.003C0.446 0.003 0.386 0.04 0.373 0.094L0.344 0.204C0.341 0.214 0.337 0.223 0.332 0.232C0.309 0.272 0.265 0.305 0.215 0.318L0.102 0.363C0.03 0.39 0.001 0.441 0.001 0.497C0.001 0.563 0.032 0.604 0.101 0.635L0.225 0.677C0.258 0.685 0.29 0.702 0.311 0.726C0.324 0.74 0.334 0.757 0.339 0.776L0.373 0.906C0.386 0.96 0.446 0.997 0.5 0.997C0.553 0.997 0.613 0.96 0.626 0.906L0.66 0.776C0.664 0.763 0.669 0.751 0.676 0.741C0.697 0.709 0.734 0.686 0.774 0.677L0.898 0.635C0.967 0.604 0.998 0.563 0.998 0.497C0.998 0.441 0.969 0.39 0.897 0.363Z" />
                  </clipPath>
                  {/* Define the gradient for the stroke */}
                  <linearGradient id="strokeGradientReversed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFDFC5" />
                    <stop offset="50%" stopColor="#FFF5E3" />
                    <stop offset="100%" stopColor="#D18F57" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Image with mask */}
              <div className="w-full h-full" style={{
              clipPath: "url(#starMaskReversed)",
              WebkitClipPath: "url(#starMaskReversed)"
            }}>
                <img src={imageSrc} alt={imageAlt} className="object-cover w-full h-full" />
              </div>
              
              {/* Standalone border SVG that sits on top - fixed alignment */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M89.7 36.3L78.4 31.8C73.4 30.5 69.0 27.2 66.7 23.2C66.2 22.3 65.7 21.4 65.4 20.4L62.6 9.4C61.3 4.0 55.3 0.3 50.0 0.3C44.6 0.3 38.6 4.0 37.3 9.4L34.4 20.4C34.1 21.4 33.7 22.3 33.2 23.2C30.9 27.2 26.5 30.5 21.5 31.8L10.2 36.3C3.0 39.0 0.1 44.1 0.1 49.7C0.1 56.3 3.2 60.4 10.1 63.5L22.5 67.7C25.8 68.5 29.0 70.2 31.1 72.6C32.4 74.0 33.4 75.7 33.9 77.6L37.3 90.6C38.6 96.0 44.6 99.7 50.0 99.7C55.3 99.7 61.3 96.0 62.6 90.6L66.0 77.6C66.4 76.3 66.9 75.1 67.6 74.1C69.7 70.9 73.4 68.6 77.4 67.7L89.8 63.5C96.7 60.4 99.8 56.3 99.8 49.7C99.8 44.1 96.9 39.0 89.7 36.3Z" fill="none" stroke="url(#strokeGradientReversed)" strokeWidth="2" vectorEffect="non-scaling-stroke" transform="scale(0.998)" style={{
                transformOrigin: 'center'
              }} />
              </svg>
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>;
};
export default RitualReversed;