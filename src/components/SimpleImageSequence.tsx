
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const SimpleImageSequence = () => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const totalFrames = 237; // Total number of frames (0-236)
  
  // Load images and track progress
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    const updateProgress = () => {
      loadedCount++;
      setLoadProgress((loadedCount / totalFrames) * 100);
      console.log(`Loaded ${loadedCount}/${totalFrames} images`);
      
      if (loadedCount === totalFrames) {
        console.log('All images loaded');
        setIsLoading(false);
      }
    };
    
    // Load all images
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      
      img.onload = updateProgress;
      img.onerror = (e) => {
        console.error(`Failed to load image ${i}: ${e}`);
        updateProgress(); // Count errors as loaded to avoid getting stuck
      };
      
      img.src = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
      img.crossOrigin = "anonymous";
      images[i] = img;
    }
    
    imagesRef.current = images;
    
    // Draw the first frame once it's loaded
    const firstImage = images[0];
    if (firstImage.complete) {
      drawImageToCanvas(firstImage, canvasRef.current!);
    } else {
      firstImage.onload = () => {
        drawImageToCanvas(firstImage, canvasRef.current!);
      };
    }
  }, []);
  
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
        if (imagesRef.current[currentFrame]) {
          drawImageToCanvas(imagesRef.current[currentFrame], canvas);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentFrame]);
  
  // Set up scroll-based scrubbing
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    
    console.log('Setting up scroll trigger');
    const canvas = canvasRef.current;
    const images = imagesRef.current;
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top", 
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: self => {
          console.log(`Scroll progress: ${self.progress.toFixed(2)}`);
          // Calculate the image index based on scroll progress
          const frameIndex = Math.min(
            Math.floor(self.progress * (totalFrames - 1)),
            totalFrames - 1
          );
          
          if (frameIndex !== currentFrame) {
            setCurrentFrame(frameIndex);
            console.log(`Drawing frame: ${frameIndex}`);
            
            if (images[frameIndex] && images[frameIndex].complete) {
              drawImageToCanvas(images[frameIndex], canvas);
            }
          }
        }
      }
    });
    
    return () => {
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    };
  }, [isLoading, currentFrame, totalFrames]);
  
  // Helper functions
  const updateCanvasSize = (canvas: HTMLCanvasElement): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  const drawImageToCanvas = (
    img: HTMLImageElement, 
    canvas: HTMLCanvasElement
  ): void => {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to cover the viewport while maintaining aspect ratio
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
    
    // Draw the image - use integer values for better performance
    ctx.drawImage(
      img, 
      Math.floor(offsetX), 
      Math.floor(offsetY), 
      Math.floor(renderWidth), 
      Math.floor(renderHeight)
    );
  };

  return (
    <div className="w-full h-screen bg-black relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-[80%] max-w-md h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="absolute text-white text-sm mt-8">{Math.floor(loadProgress)}%</div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default SimpleImageSequence;
