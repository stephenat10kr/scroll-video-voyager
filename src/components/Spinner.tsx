
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import colors from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);

const Spinner: React.FC = () => {
  const spinnerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!spinnerRef.current) return;

    // Set initial rotation to 0
    gsap.set(spinnerRef.current, { rotation: 0 });

    // Create scroll-based animation
    const animation = gsap.to(spinnerRef.current, {
      rotation: 360, // Full rotation
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: spinnerRef.current,
        start: "top bottom", // Start when top of spinner hits bottom of viewport
        end: "bottom top", // End when bottom of spinner leaves top of viewport
        scrub: 1, // Smooth scrubbing with 1 second lag
        toggleActions: "play reverse play reverse", // Controls the playback
        // markers: true, // Debug markers (remove in production)
      }
    });

    return () => {
      // Clean up animation when component unmounts
      animation.scrollTrigger?.kill();
    };
  }, []);

  return (
    <div className="flex flex-col items-center my-8">
      <svg 
        ref={spinnerRef}
        width="32" 
        height="33" 
        viewBox="0 0 32 33" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform mb-3" // Added mb-3 for 12px padding
      >
        <path 
          d="M16.9645 2.42119C16.9645 3.6242 16.7788 7.79463 16.344 9.09894C16.2427 9.39864 16.1456 9.38175 16.0908 9.38175C16.0359 9.38175 15.9388 9.39019 15.8375 9.09894C15.3901 7.79463 15.217 3.6242 15.217 2.42119C15.217 1.902 15.141 0.770752 16.0908 0.770752C17.0405 0.770752 16.9645 1.90622 16.9645 2.42119ZM27.3821 5.52369C26.7152 4.85676 25.9639 5.70941 25.5966 6.07665C24.744 6.92931 21.9158 9.99803 21.3122 11.239C21.1772 11.5134 21.2531 11.5767 21.2911 11.6189C21.3291 11.6611 21.3882 11.7413 21.671 11.5978C22.9036 10.9815 25.9807 8.16608 26.8334 7.31342C27.2006 6.94619 28.0533 6.19906 27.3864 5.52791L27.3821 5.52369ZM32 16.8657C32 15.9202 30.8645 15.992 30.3496 15.992C29.1466 15.992 24.9719 16.165 23.6718 16.6125C23.3806 16.7138 23.389 16.8109 23.389 16.8657C23.389 16.9206 23.3721 17.0177 23.6718 17.119C24.9803 17.5538 29.1466 17.7395 30.3496 17.7395C30.8688 17.7395 32 17.8155 32 16.8657ZM27.2471 28.1529C27.914 27.486 27.0613 26.7346 26.6941 26.3674C25.8414 25.5147 22.7727 22.6866 21.5317 22.083C21.2574 21.9479 21.194 22.0239 21.1518 22.0619C21.1096 22.0999 21.0294 22.159 21.1729 22.4418C21.7892 23.6743 24.6047 26.7515 25.4573 27.6042C25.8246 27.9714 26.5717 28.824 27.2428 28.1571L27.2471 28.1529ZM15.905 32.7708C16.8505 32.7708 16.7788 31.6353 16.7788 31.1203C16.7788 29.9173 16.6057 25.7427 16.1583 24.4426C16.057 24.1513 15.9599 24.1597 15.905 24.1597C15.8502 24.1597 15.7531 24.1429 15.6518 24.4426C15.217 25.7511 15.0313 29.9173 15.0313 31.1203C15.0313 31.6395 14.9553 32.7708 15.905 32.7708ZM4.62208 28.0178C5.28901 28.6847 6.04036 27.8321 6.4076 27.4649C7.26026 26.6122 10.0884 23.5435 10.692 22.3025C10.8271 22.0281 10.7511 21.9648 10.7131 21.9226C10.6751 21.8804 10.616 21.8002 10.3332 21.9437C9.10065 22.56 6.02348 25.3754 5.17082 26.2281C4.80359 26.5953 3.95093 27.3424 4.61786 28.0136L4.62208 28.0178ZM0 16.6758C0 17.6213 1.13547 17.5495 1.65044 17.5495C2.85345 17.5495 7.0281 17.3765 8.32819 16.929C8.61944 16.8277 8.611 16.7307 8.611 16.6758C8.611 16.6209 8.62789 16.5238 8.32819 16.4225C7.01965 15.9877 2.85345 15.802 1.65044 15.802C1.13125 15.802 0 15.726 0 16.6758ZM4.75293 5.39283C4.086 6.05976 4.93866 6.81112 5.3059 7.17835C6.15855 8.03101 9.22728 10.8591 10.4683 11.4627C10.7426 11.5978 10.806 11.5218 10.8482 11.4839C10.8904 11.4459 10.9706 11.3868 10.8271 11.104C10.2108 9.8714 7.39533 6.79423 6.54267 5.94157C6.17544 5.57434 5.42831 4.72168 4.75716 5.38861L4.75293 5.39283Z" 
          fill={colors.coral}
        />
      </svg>
      
      {/* 60px vertical dotted line with 1px dash and 4px gap */}
      <div 
        className="h-[60px] w-[1px]"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, ${colors.coral} 1px, transparent 1px)`,
          backgroundSize: '1px 5px', // 1px dash + 4px gap = 5px total
          backgroundRepeat: 'repeat-y'
        }}
      ></div>
    </div>
  );
};

export default Spinner;
