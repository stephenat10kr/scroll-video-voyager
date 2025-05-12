
import React from "react";
import colors from "@/lib/theme";

export interface CustomButtonProps {
  onClick?: () => void;
  className?: string;
}

export const CustomPrevButton = ({ onClick, className }: CustomButtonProps) => (
  <button 
    onClick={onClick} 
    className={`relative group transition-all duration-300 ${className || ''}`}
    aria-label="Previous slide"
  >
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_6492_11821)">
        <g clipPath="url(#clip1_6492_11821)">
          <rect width="16" height="16" transform="translate(16 16)" fill="transparent" fillOpacity="0.01" style={{mixBlendMode:"multiply"}}/>
          <path 
            d="M26 20L22 24L26 28" 
            stroke={colors.coral} 
            className="group-hover:stroke-[#203435] transition-all duration-300"
          />
        </g>
      </g>
      <rect 
        x="0.5" 
        y="0.5" 
        width="47" 
        height="47" 
        rx="23.5" 
        stroke={colors.coral}
        className="group-hover:fill-[#FFB577] group-hover:stroke-[#FFB577] transition-all duration-300"
      />
      <defs>
        <clipPath id="clip0_6492_11821">
          <rect width="48" height="48" rx="24" fill="white"/>
        </clipPath>
        <clipPath id="clip1_6492_11821">
          <rect width="16" height="16" fill="white" transform="translate(16 16)"/>
        </clipPath>
      </defs>
    </svg>
  </button>
);

export const CustomNextButton = ({ onClick, className }: CustomButtonProps) => (
  <button 
    onClick={onClick} 
    className={`relative group transition-all duration-300 ${className || ''}`}
    aria-label="Next slide"
  >
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_6492_11822)">
        <g clipPath="url(#clip1_6492_11822)">
          <rect width="16" height="16" transform="translate(16 16)" fill="transparent" fillOpacity="0.01" style={{mixBlendMode:"multiply"}}/>
          <path 
            d="M22 28L26 24L22 20" 
            stroke={colors.coral} 
            className="group-hover:stroke-[#203435] transition-all duration-300"
          />
        </g>
      </g>
      <rect 
        x="0.5" 
        y="0.5" 
        width="47" 
        height="47" 
        rx="23.5" 
        stroke={colors.coral}
        className="group-hover:fill-[#FFB577] group-hover:stroke-[#FFB577] transition-all duration-300"
      />
      <defs>
        <clipPath id="clip0_6492_11822">
          <rect width="48" height="48" rx="24" fill="white"/>
        </clipPath>
        <clipPath id="clip1_6492_11822">
          <rect width="16" height="16" fill="white" transform="translate(16 16)"/>
        </clipPath>
      </defs>
    </svg>
  </button>
);
