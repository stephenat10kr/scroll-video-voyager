
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
  const concurrentLoads = 8; // Number of images to load concurrently
  
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

    // Load all images with concurrency
    loadAllImages();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [onReady]);
  
  // Load all images with concurrency control
  const loadAllImages = async () => {
    let loadedCount = 0;
    const totalImages = totalFrames;
    let activeLoads = 0;
    let nextIndexToLoad = 0;
    
    // Function to load a single image
    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (index >= totalImages) {
          resolve();
          return;
        }
        
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
        
        // Add cache busting if needed (remove in production)
        // const cacheBuster = Date.now();
        img.src = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
        
        // Set crossOrigin to anonymous to avoid CORS issues with canvas
        img.crossOrigin = "anonymous";
      });
    };
    
    // Process queue function to manage concurrent loading
    const processQueue = async () => {
      if (nextIndexToLoad >= totalImages) return;
      
      const currentIndex = nextIndexToLoad++;
      activeLoads++;
      
      try {
        await loadImage(currentIndex);
      } finally {
        activeLoads--;
        
        // If we've loaded all images, mark as complete
        if (loadedCount >= totalImages) {
          setIsLoading(false);
          if (onReady) onReady();
          
          return;
        }
        
        // Continue loading more images
        processQueue();
      }
    };
    
    // Start initial batch of concurrent loads
    const initialBatch = Math.min(concurrentLoads, totalImages);
    for (let i = 0; i < initialBatch; i++) {
      processQueue();
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
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
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
