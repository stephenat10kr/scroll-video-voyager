
import React, { useEffect, useRef, useState } from "react";

interface FlipTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const FlipText: React.FC<FlipTextProps> = ({ text, className = "", style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When element comes into view (middle of viewport)
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            setIsVisible(true);
            hasAnimatedRef.current = true;
          } 
          
          // Reset animation only when completely out of view
          if (!entry.isIntersecting && entry.intersectionRatio === 0) {
            hasAnimatedRef.current = false;
          }
        });
      },
      {
        threshold: [0, 0.5], // 0 for completely out of view, 0.5 for halfway in view
        rootMargin: "-20% 0px" // Trigger closer to middle of viewport
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return (
    <span 
      className={`flip-text-container ${className}`} 
      style={style}
    >
      <span 
        ref={elementRef}
        className={`flip-text ${isVisible ? 'flip-visible' : ''}`}
        data-text={text}
      >
        {/* Empty space instead of text */}
        {!isVisible ? '\u00A0' : text}
      </span>
    </span>
  );
};

export default FlipText;
