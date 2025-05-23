
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Progress } from './ui/progress';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({ onReady }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const totalFrames = 237; // Total number of frames (0-236)
  
  // Set up canvas and image loading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Size canvas to viewport
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    // Initialize image arrays
    imagesRef.current = new Array(totalFrames);

    // Load all images simultaneously
    loadAllImages();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [onReady]);
  
  // Load all images simultaneously
  const loadAllImages = async () => {
    let loadedCount = 0;
    const totalImages = totalFrames;
    const loadingPromises: Promise<void>[] = [];
    
    // Start loading all images at once
    for (let i = 0; i < totalImages; i++) {
      const loadPromise = loadImage(i);
      loadingPromises.push(loadPromise);
    }
    
    // Wait for all images to load
    await Promise.all(loadingPromises);
    
    // Mark loading as complete
    setIsLoading(false);
    if (onReady) onReady();
    
    // Function to load a single image
    function loadImage(index: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        const paddedIndex = index.toString().padStart(3, '0');
        
        img.onload = () => {
          imagesRef.current[index] = img;
          loadedCount++;
          
          // Update progress
          setLoadProgress((loadedCount / totalImages) * 100);
          
          // If this is the first frame, show it immediately
          if (index === 0 && canvasRef.current) {
            drawImageToCanvas(img);
          }
          
          resolve();
        };
        
        img.onerror = () => {
          // Continue even if image fails to load
          loadedCount++;
          setLoadProgress((loadedCount / totalImages) * 100);
          resolve();
        };
        
        img.src = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
        img.crossOrigin = "anonymous";
      });
    }
  };
  
  // Draw the current image to canvas, maintaining aspect ratio
  const drawImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to cover the viewport height while maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    
    let renderWidth, renderHeight, offsetX, offsetY;
    
    // Make sure the image always covers the viewport height
    renderHeight = canvas.height;
    renderWidth = renderHeight * imgRatio;
    
    // Center horizontally if wider than canvas
    offsetX = (canvas.width - renderWidth) / 2;
    offsetY = 0;
    
    // If the calculated width is less than canvas width, stretch to cover width too
    if (renderWidth < canvas.width) {
      renderWidth = canvas.width;
      renderHeight = renderWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    }
    
    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };
  
  // Set up scroll-based scrubbing
  useEffect(() => {
    if (isLoading || !containerRef.current) return;
    
    // Create timeline for scroll scrubbing - adjust to work with sticky positioning
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
            
            // Draw the new image if it's loaded
            if (imagesRef.current[frameIndex]) {
              drawImageToCanvas(imagesRef.current[frameIndex]);
            }
          }
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
  }, [isLoading, currentFrame]);

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
