
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 437; // Total number of frames in the sequence
const IMAGE_FORMAT = (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`;

export default function ImageSequencer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Preload first frame
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.src = IMAGE_FORMAT(1);
  }, []);

  // Set up scroll trigger
  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=1000",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const frame = Math.floor(self.progress * (TOTAL_FRAMES - 1)) + 1;
        setCurrentFrame(Math.min(frame, TOTAL_FRAMES));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <img
          src={IMAGE_FORMAT(currentFrame)}
          alt={`Frame ${currentFrame}`}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs">
          Frame: {currentFrame} / {TOTAL_FRAMES}
        </div>
      )}
    </div>
  );
}
