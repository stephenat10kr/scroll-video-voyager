
import React from "react";
import colors from "@/lib/theme";

export interface CustomButtonProps {
  onClick?: () => void;
  className?: string;
}

export const CustomPrevButton = ({ onClick, className }: CustomButtonProps) => (
  <button 
    onClick={onClick} 
    className={`relative group transition-all duration-300 ease-in-out ${className || ''}`}
    aria-label="Previous slide"
  >
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="28" 
        cy="28" 
        r="27.5" 
        transform="rotate(-180 28 28)" 
        stroke={colors.coral} 
        className="group-hover:fill-[#FFB577] transition-all duration-300 ease-in-out"
      />
      <path 
        d="M26 34.75L19.5 28.25L26 21.75M20 28.25L36.5 28.25" 
        stroke={colors.coral} 
        strokeLinecap="square"
        className="group-hover:stroke-[#203435] transition-all duration-300 ease-in-out"
      />
    </svg>
  </button>
);

export const CustomNextButton = ({ onClick, className }: CustomButtonProps) => (
  <button 
    onClick={onClick} 
    className={`relative group transition-all duration-300 ease-in-out ${className || ''}`}
    aria-label="Next slide"
  >
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="28" 
        cy="28" 
        r="27.5" 
        stroke={colors.coral}
        className="group-hover:fill-[#FFB577] transition-all duration-300 ease-in-out"
      />
      <path 
        d="M30 21.25L36.5 27.75L30 34.25M36 27.75H19.5" 
        stroke={colors.coral} 
        strokeLinecap="square"
        className="group-hover:stroke-[#203435] transition-all duration-300 ease-in-out"
      />
    </svg>
  </button>
);
