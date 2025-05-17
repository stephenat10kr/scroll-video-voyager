
import React, { useEffect, useRef, useState } from "react";

interface FlipTextProps {
  text: string;
  color?: string;
  className?: string;
  dataHover?: string;
}

const FlipText: React.FC<FlipTextProps> = ({
  text,
  color,
  className = "",
  dataHover,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is entering the viewport
            setIsVisible(true);
            hasAnimated.current = true;
          } else if (entry.intersectionRatio === 0) {
            // Only reset when completely out of view
            hasAnimated.current = false;
            setIsVisible(false);
          }
        });
      },
      {
        threshold: [0, 0.5], // Observe at 0% and 50% visibility 
        rootMargin: '-5% 0px' // Slightly offset to trigger closer to middle
      }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  return (
    <span 
      className={`flip-text-container ${className}`}
      style={{ 
        color: color || 'inherit',
        perspective: '1000px',
        display: 'inline-block'
      }}
    >
      <span 
        ref={textRef}
        className={`flip-text ${isVisible ? 'flip-visible' : ''}`}
        data-hover={dataHover || text}
        style={{
          position: 'relative',
          display: 'inline-block',
          transition: 'transform 0.6s',
          transformOrigin: '50% 0',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Render an empty space with same width but opacity 0 */}
        <span style={{ opacity: 0 }}>{text}</span>
      </span>
    </span>
  );
};

export default FlipText;
