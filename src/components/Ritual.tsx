
import React, { useRef, useEffect } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import colors from "@/lib/theme";
import { useScrollPosition } from "@/hooks/useScrollPosition";

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
  const scrollPosition = useScrollPosition();
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef(0);
  const gradientAngle = useRef(45); // Starting at 45 degrees
  
  useEffect(() => {
    if (!elementRef.current || !gradientRef.current) return;
    
    // Calculate if element is in viewport
    const rect = elementRef.current.getBoundingClientRect();
    const elementInView = 
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0;
    
    if (elementInView) {
      // Calculate delta for rotation direction
      const delta = scrollPosition - lastScrollPosition.current;
      // Rotate clockwise when scrolling down, counterclockwise when scrolling up
      // Scale the rotation based on scroll amount, with easing
      const rotationAmount = delta * 0.1; // Adjust this value for rotation speed
      gradientAngle.current += rotationAmount;
      
      // Apply rotation to gradient
      if (gradientRef.current) {
        // Use GSAP-like easing
        const update = () => {
          if (gradientRef.current) {
            gradientRef.current.setAttribute('gradientTransform', `rotate(${gradientAngle.current})`);
          }
        };
        
        // Simple easing function
        requestAnimationFrame(update);
      }
    }
    
    lastScrollPosition.current = scrollPosition;
  }, [scrollPosition]);
  
  return <div className="grid grid-cols-12 gap-8 mb-16 last:mb-48" ref={elementRef}>
      {/* Image Section - Always on left (cols 1-5) */}
      <div className="col-span-12 md:col-span-5 md:col-start-1">
        <AspectRatio ratio={1 / 1} className="mb-4 md:mb-0 rounded-lg overflow-hidden w-full">
          <div className="w-full h-full relative">
            {/* SVG Mask definition with gradient */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="starMask" clipPathUnits="objectBoundingBox">
                  <path d="M0.897 0.363L0.784 0.318C0.734 0.305 0.69 0.272 0.667 0.232C0.662 0.223 0.657 0.214 0.654 0.204L0.626 0.094C0.613 0.04 0.553 0.003 0.5 0.003C0.446 0.003 0.386 0.04 0.373 0.094L0.344 0.204C0.341 0.214 0.337 0.223 0.332 0.232C0.309 0.272 0.265 0.305 0.215 0.318L0.102 0.363C0.03 0.39 0.001 0.441 0.001 0.497C0.001 0.563 0.032 0.604 0.101 0.635L0.225 0.677C0.258 0.685 0.29 0.702 0.311 0.726C0.324 0.74 0.334 0.757 0.339 0.776L0.373 0.906C0.386 0.96 0.446 0.997 0.5 0.997C0.553 0.997 0.613 0.96 0.626 0.906L0.66 0.776C0.664 0.763 0.669 0.751 0.676 0.741C0.697 0.709 0.734 0.686 0.774 0.677L0.898 0.635C0.967 0.604 0.998 0.563 0.998 0.497C0.998 0.441 0.969 0.39 0.897 0.363Z" />
                </clipPath>
                {/* Define the gradient for the stroke with a ref for rotation */}
                <linearGradient 
                  id="strokeGradient" 
                  x1="0%" 
                  y1="0%" 
                  x2="100%" 
                  y2="100%"
                  ref={gradientRef}
                  gradientTransform="rotate(45)"
                >
                  <stop offset="0%" stopColor="#FFDFC5" />
                  <stop offset="50%" stopColor="#FFF5E3" />
                  <stop offset="100%" stopColor="#D18F57" />
                </linearGradient>
              </defs>
            </svg>
            
            <img src={imageSrc} alt={imageAlt} className="object-cover w-full h-full" style={{
              clipPath: "url(#starMask)",
              WebkitClipPath: "url(#starMask)" // Adding browser prefix
            }} />
            
            {/* Inner stroke SVG overlay - positioned on top of the image with the same mask */}
            <svg 
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              style={{
                clipPath: "url(#starMask)",
                WebkitClipPath: "url(#starMask)"
              }}
            >
              <path 
                d="M0.897 0.363L0.784 0.318C0.734 0.305 0.69 0.272 0.667 0.232C0.662 0.223 0.657 0.214 0.654 0.204L0.626 0.094C0.613 0.04 0.553 0.003 0.5 0.003C0.446 0.003 0.386 0.04 0.373 0.094L0.344 0.204C0.341 0.214 0.337 0.223 0.332 0.232C0.309 0.272 0.265 0.305 0.215 0.318L0.102 0.363C0.03 0.39 0.001 0.441 0.001 0.497C0.001 0.563 0.032 0.604 0.101 0.635L0.225 0.677C0.258 0.685 0.29 0.702 0.311 0.726C0.324 0.74 0.334 0.757 0.339 0.776L0.373 0.906C0.386 0.96 0.446 0.997 0.5 0.997C0.553 0.997 0.613 0.96 0.626 0.906L0.66 0.776C0.664 0.763 0.669 0.751 0.676 0.741C0.697 0.709 0.734 0.686 0.774 0.677L0.898 0.635C0.967 0.604 0.998 0.563 0.998 0.497C0.998 0.441 0.969 0.39 0.897 0.363Z"
                fill="none"
                stroke="url(#strokeGradient)"
                strokeWidth="0.016"
              />
            </svg>
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
