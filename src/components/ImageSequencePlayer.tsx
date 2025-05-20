
import React, { useRef, useEffect, useState } from "react";

interface ImageSequencePlayerProps {
  totalFrames?: number;
  basePath?: string;
  onReady?: () => void;
}

const ImageSequencePlayer: React.FC<ImageSequencePlayerProps> = ({
  totalFrames = 99,
  basePath = "/image-seq/",
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const requestIdRef = useRef<number | null>(null);
  const lastFrameIndexRef = useRef<number>(-1);
  
  // Format frame number as 4-digit string (e.g., 0001, 0099)
  const formatFrameNumber = (num: number): string => {
    return num.toString().padStart(4, '0');
  };
  
  // Preload all frames
  useEffect(() => {
    console.log("ImageSequence - Starting to preload frames");
    let loadedCount = 0;
    const framesToLoad = totalFrames;
    
    // Clear any existing imageRefs
    imageRefs.current = [];
    
    // Preload images in a staggered way to not overwhelm the browser
    const preloadImages = () => {
      // Create a small batch of images to load at a time
      const BATCH_SIZE = 5;
      let currentBatch = 0;
      const totalBatches = Math.ceil(framesToLoad / BATCH_SIZE);
      
      const loadNextBatch = () => {
        if (currentBatch >= totalBatches) return;
        
        const startIndex = currentBatch * BATCH_SIZE + 1;
        const endIndex = Math.min(startIndex + BATCH_SIZE - 1, framesToLoad);
        
        // Process this batch
        for (let i = startIndex; i <= endIndex; i++) {
          const img = new Image();
          
          img.onload = () => {
            loadedCount++;
            setFramesLoaded(loadedCount);
            
            if (loadedCount === framesToLoad) {
              console.log(`ImageSequence - All ${framesToLoad} frames loaded`);
              setAllFramesLoaded(true);
              if (onReady) {
                onReady();
              }
              
              // Draw the first frame once all images are loaded
              drawFrame(1);
            }
          };
          
          img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            loadedCount++; // Count errors as loaded to avoid getting stuck
            setFramesLoaded(loadedCount);
          };
          
          const frameNumber = formatFrameNumber(i);
          img.src = `${basePath}${frameNumber}.webp`;
          imageRefs.current[i] = img;
        }
        
        currentBatch++;
        
        // Schedule next batch with a small delay
        setTimeout(loadNextBatch, 50);
      };
      
      // Start loading the first batch
      loadNextBatch();
    };
    
    preloadImages();
    
    return () => {
      // Clear references and cancel any pending operations
      imageRefs.current = [];
    };
  }, [totalFrames, basePath, onReady]);
  
  // Draw a specific frame on the canvas
  const drawFrame = (frameIndex: number) => {
    if (frameIndex < 1 || frameIndex > totalFrames) return;
    
    const canvas = canvasRef.current;
    const img = imageRefs.current[frameIndex];
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image, preserving aspect ratio
    const scale = Math.min(
      canvas.width / img.naturalWidth, 
      canvas.height / img.naturalHeight
    );
    
    // Center the image on the canvas
    const x = (canvas.width - img.naturalWidth * scale) / 2;
    const y = (canvas.height - img.naturalHeight * scale) / 2;
    
    // Draw at proper scale
    ctx.drawImage(
      img, 
      0, 0, img.naturalWidth, img.naturalHeight,
      x, y, img.naturalWidth * scale, img.naturalHeight * scale
    );
  };
  
  // Handle scroll position and update the displayed frame
  useEffect(() => {
    if (!allFramesLoaded) return;
    
    // Calculate the appropriate frame based on scroll position
    const updateFrame = () => {
      if (!containerRef.current) return;
      
      // Calculate scroll position and progress
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - windowHeight;
      const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
      
      // Determine which frame to show
      const frameIndex = Math.min(
        Math.max(1, Math.ceil(scrollProgress * totalFrames)),
        totalFrames
      );
      
      // Only update if the frame has changed
      if (frameIndex !== lastFrameIndexRef.current) {
        if (frameIndex === 1 || frameIndex === totalFrames) {
          console.log(`ImageSequence - Showing frame: ${frameIndex} (${scrollProgress.toFixed(2)})`);
        }
        
        lastFrameIndexRef.current = frameIndex;
        drawFrame(frameIndex);
      }
      
      // Continue the animation loop
      requestIdRef.current = requestAnimationFrame(updateFrame);
    };
    
    // Initialize canvas size
    const initCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        // Set canvas to viewport size
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Draw the first frame
        drawFrame(1);
      }
    };
    
    // Set up resize handling
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawFrame(lastFrameIndexRef.current > 0 ? lastFrameIndexRef.current : 1);
      }
    };
    
    // Initialize canvas and start animation loop
    initCanvas();
    requestIdRef.current = requestAnimationFrame(updateFrame);
    window.addEventListener('resize', handleResize);
    
    // Clean up on unmount
    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [allFramesLoaded, totalFrames]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ height: `calc(100vh + 4000px)` }} // Extra height for scrolling
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen z-10 object-contain bg-black"
      />
      
      {!allFramesLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-white text-center">
            <div className="mb-4">Loading frames: {framesLoaded}/{totalFrames}</div>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white"
                style={{ width: `${(framesLoaded / totalFrames) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSequencePlayer;
