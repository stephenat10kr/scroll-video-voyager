
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Progress } from './ui/progress';
import { useImageSequence } from '../hooks/useImageSequence';
import { updateCanvasSize } from '../utils/imageSequenceUtils';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({ onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalFrames = 237; // Total number of frames (0-236)
  
  const { 
    isLoading, 
    loadProgress, 
    currentFrame, 
    setCurrentFrame,
    drawFrame
  } = useImageSequence({
    totalFrames,
    onReady
  });
  
  // Set up canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initial canvas setup
    updateCanvasSize(canvas);
    
    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        updateCanvasSize(canvas);
        // Redraw current frame after resize
        drawFrame(currentFrame, canvas);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentFrame, drawFrame]);
  
  // Set up scroll-based scrubbing
  useEffect(() => {
    if (isLoading || !containerRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Ensure at least the first frame is visible
    drawFrame(0, canvas);
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body, // Use body as trigger instead of the container
        start: "top top", 
        end: "bottom bottom",
        scrub: 0.5, // Smoother scrubbing
        onUpdate: self => {
          // Calculate the image index based on scroll progress
          const frameIndex = Math.min(
            Math.floor(self.progress * (totalFrames - 1)),
            totalFrames - 1
          );
          
          if (frameIndex !== currentFrame) {
            setCurrentFrame(frameIndex);
            drawFrame(frameIndex, canvas);
          }
        },
        // Handle end of scrolling events
        onLeave: () => {
          // Last frame when scrolling beyond end
          const lastFrameIndex = totalFrames - 1;
          drawFrame(lastFrameIndex, canvas);
        },
        onLeaveBack: () => {
          // First frame when scrolling back to top
          drawFrame(0, canvas);
        },
        onRefresh: () => {
          // Redraw on ScrollTrigger refresh
          drawFrame(currentFrame, canvas);
        }
      }
    });
    
    return () => {
      // Clean up
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    };
  }, [isLoading, currentFrame, drawFrame, setCurrentFrame, totalFrames]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen bg-black relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Progress 
            value={loadProgress} 
            className="w-[80%] max-w-md" 
            indicatorClassName="bg-white"
          />
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default ImageSequenceScrubber;
