
import React, { useEffect, useRef } from "react";
import colors from "@/lib/theme";
import Spinner from "./Spinner";

interface ValueProps {
  valueTitle: string;
  valueText: string[];
  isLast?: boolean;
}

const Value: React.FC<ValueProps> = ({
  valueTitle,
  valueText,
  isLast = false
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-title');
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of element is visible
        rootMargin: '-10% 0px' // Slightly offset to trigger closer to middle
      }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, []);

  return (
    <div className={`w-full h-screen flex flex-col justify-center bg-transparent ${isLast ? '' : 'mb-6'}`}>
      <h2 
        ref={titleRef}
        className="title-xl mb-6 text-center py-[56px] bg-transparent opacity-0 transform translate-y-10 transition-all duration-700 ease-out" 
        style={{ color: colors.coral }}
      >
        {valueTitle}
      </h2>
      
      {/* Spinner component placed between title and text */}
      <div className="flex justify-center bg-transparent">
        <Spinner />
      </div>
      
      <div className="space-y-1 bg-transparent">
        {valueText.map((text, index) => (
          <p 
            key={index} 
            className="title-sm text-center bg-transparent" 
            style={{ color: colors.coral }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Value;
