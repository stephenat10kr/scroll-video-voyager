
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spinner from './Spinner';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({ onReady }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedImages = useRef<boolean[]>([]);
  const totalFrames = 237; // Total number of frames (0-236)
  const initialLoadCount = 24; // Load just enough images to start
  const readyCalledRef = useRef(false);
  
  // Set up canvas and initial loading
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
    loadedImages.current = new Array(totalFrames).fill(false);

    // First, load key frames (every 10th frame initially)
    const loadKeyFrames = async () => {
      const keyFramesToLoad = [];
      
      // Load just first frame and every 10th frame up to initialLoadCount
      keyFramesToLoad.push(0);
      for (let i = 10; i < Math.min(initialLoadCount, totalFrames); i += 10) {
        keyFramesToLoad.push(i);
      }
      
      let loadedCount = 0;
      
      for (const index of keyFramesToLoad) {
        await loadImage(index);
        loadedCount++;
        setLoadProgress((loadedCount / initialLoadCount) * 50); // First 50% of progress bar
      }
      
      // Once initial key frames are loaded, show the first frame
      if (imagesRef.current[0] && loadedImages.current[0]) {
        drawImageToCanvas(imagesRef.current[0]);
        setIsLoading(false);
        
        // Notify ready if callback provided
        if (onReady && !readyCalledRef.current) {
          onReady();
          readyCalledRef.current = true;
        }
        
        // Load remaining frames in the background
        loadRemainingFrames();
      }
    };
    
    loadKeyFrames();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [onReady]);
  
  // Load a single image and return a promise
  const loadImage = (index: number): Promise<void> => {
    return new Promise((resolve) => {
      if (loadedImages.current[index]) {
        resolve(); // Already loaded
        return;
      }
      
      const paddedIndex = index.toString().padStart(3, '0');
      const img = new Image();
      
      img.onload = () => {
        loadedImages.current[index] = true;
        imagesRef.current[index] = img;
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${paddedIndex}`);
        resolve(); // Resolve anyway to continue loading other images
      };
      
      img.src = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
    });
  };
  
  // Load remaining frames in background with priority to frames near current position
  const loadRemainingFrames = async () => {
    // Calculate how many frames are left to load
    const remainingFrames = totalFrames - initialLoadCount;
    let loadedCount = initialLoadCount;
    
    // Generate a loading sequence that prioritizes frames near the current frame
    // Start with frames immediately around current frame, then expand outward
    const loadingSequence = generateLoadingSequence(currentFrame, totalFrames);
    
    // Load frames in batches to not overwhelm the browser
    const batchSize = 5;
    for (let i = 0; i < loadingSequence.length; i += batchSize) {
      const batch = loadingSequence.slice(i, i + batchSize);
      await Promise.all(batch.map(index => loadImage(index)));
      
      // Update progress for the remaining 50%
      loadedCount += batch.length;
      setLoadProgress(50 + ((loadedCount - initialLoadCount) / remainingFrames) * 50);
      
      // Allow a small break between batches
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('All frames loaded');
  };
  
  // Generate a loading sequence that prioritizes frames near the current frame
  const generateLoadingSequence = (current: number, total: number): number[] => {
    const sequence: number[] = [];
    const alreadyAdded = new Set<number>();
    
    // Add frames that were loaded in initial batch
    for (let i = 0; i < initialLoadCount; i++) {
      if (i % 10 === 0 || i === 0) {
        alreadyAdded.add(i);
      }
    }
    
    // Start from current frame and expand outwards
    let distance = 1;
    while (sequence.length < total - alreadyAdded.size) {
      // Look forward
      const forward = current + distance;
      if (forward < total && !alreadyAdded.has(forward)) {
        sequence.push(forward);
        alreadyAdded.add(forward);
      }
      
      // Look backward
      const backward = current - distance;
      if (backward >= 0 && !alreadyAdded.has(backward)) {
        sequence.push(backward);
        alreadyAdded.add(backward);
      }
      
      distance++;
    }
    
    return sequence;
  };
  
  // Draw the current image to canvas, maintaining aspect ratio and covering the viewport
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
    
    console.log('Setting up image sequence scrubbing');
    
    // Create timeline for scroll scrubbing with improved configuration
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
            if (imagesRef.current[frameIndex] && loadedImages.current[frameIndex]) {
              drawImageToCanvas(imagesRef.current[frameIndex]);
            } else {
              // If current frame isn't loaded yet, find closest loaded frame
              let closestLoaded = findClosestLoadedFrame(frameIndex);
              if (closestLoaded >= 0) {
                drawImageToCanvas(imagesRef.current[closestLoaded]);
              }
              
              // Prioritize loading this frame
              loadImage(frameIndex);
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
  
  // Find the closest frame that has been loaded
  const findClosestLoadedFrame = (targetIndex: number): number => {
    // Check target frame first
    if (loadedImages.current[targetIndex]) return targetIndex;
    
    // Look for the closest loaded frame (alternating between before and after)
    let distance = 1;
    const maxDistance = totalFrames;
    
    while (distance < maxDistance) {
      // Check before
      const beforeIndex = targetIndex - distance;
      if (beforeIndex >= 0 && loadedImages.current[beforeIndex]) {
        return beforeIndex;
      }
      
      // Check after
      const afterIndex = targetIndex + distance;
      if (afterIndex < totalFrames && loadedImages.current[afterIndex]) {
        return afterIndex;
      }
      
      distance++;
    }
    
    return -1; // No loaded frame found (shouldn't happen if at least one frame is loaded)
  };

  return (
    <div 
      ref={containerRef} 
      className="video-container w-full h-screen bg-black"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <Spinner />
            <p className="text-white mt-4">Loading Image Sequence: {Math.round(loadProgress)}%</p>
          </div>
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
