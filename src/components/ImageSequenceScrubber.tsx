
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spinner from './Spinner';
import { useIsAndroid } from '@/hooks/use-android';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({ onReady }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedImages = useRef<boolean[]>([]);
  const [isReady, setIsReady] = useState(false);
  const readyCalledRef = useRef(false);
  const isAndroid = useIsAndroid();
  const loadQueueRef = useRef<number[]>([]);
  const initialLoadCompleteRef = useRef(false);
  
  // Generate image paths for the sequence
  useEffect(() => {
    const imageUrls: string[] = [];
    // Generate paths for images 0-236 (based on the files in the folder)
    for (let i = 0; i <= 236; i++) {
      const paddedIndex = i.toString().padStart(3, '0');
      imageUrls.push(`/image-sequence/LS_HeroSequence${paddedIndex}.jpg`);
    }
    setImages(imageUrls);
  }, []);
  
  // Initialize canvas and images with progressive loading
  useEffect(() => {
    if (images.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas to match viewport dimensions
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Handle resize
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    // Preload all images with progressive loading
    imagesRef.current = new Array(images.length);
    loadedImages.current = new Array(images.length).fill(false);
    
    let loadedCount = 0;
    const totalImages = images.length;

    // Define key frames to load first (for faster initial rendering)
    const loadKeyframesFirst = () => {
      // Load every 10th frame first (or adjust based on sequence length)
      const keyFrameIndices: number[] = [];
      const step = isAndroid ? 20 : 10; // Larger step for Android to improve initial load time
      
      for (let i = 0; i < totalImages; i += step) {
        keyFrameIndices.push(i);
      }
      
      // Always include first and last frame
      if (!keyFrameIndices.includes(0)) keyFrameIndices.push(0);
      if (!keyFrameIndices.includes(totalImages - 1)) keyFrameIndices.push(totalImages - 1);
      
      return keyFrameIndices.sort((a, b) => a - b);
    };
    
    // Get remaining frames that aren't key frames
    const getRemainingFrames = (keyframes: number[]) => {
      const remaining: number[] = [];
      for (let i = 0; i < totalImages; i++) {
        if (!keyframes.includes(i)) {
          remaining.push(i);
        }
      }
      return remaining;
    };
    
    // Load an image at the given index
    const loadImageAtIndex = (index: number) => {
      if (loadedImages.current[index]) return; // Skip if already loaded
      
      const img = new Image();
      img.onload = () => {
        loadedImages.current[index] = true;
        imagesRef.current[index] = img;
        loadedCount++;
        
        // Update loading progress
        setLoadProgress((loadedCount / totalImages) * 100);
        
        // Draw the first image once it's loaded
        if (index === 0 && !initialLoadCompleteRef.current) {
          drawImageToCanvas(img);
        }
        
        // Process queue when keyframes are loaded
        if (loadedCount === keyFrameIndices.length && !initialLoadCompleteRef.current) {
          console.log('Key frames loaded, ready for interaction');
          initialLoadCompleteRef.current = true;
          setIsLoading(false);
          setIsReady(true);
          
          if (onReady && !readyCalledRef.current) {
            onReady();
            readyCalledRef.current = true;
          }
          
          // Start loading the remaining frames
          processRemainingQueue();
        }
      };
      
      img.src = images[index];
    };
    
    // Process the queue of remaining images to load in the background
    const processRemainingQueue = () => {
      // Load remaining frames in the background
      console.log('Starting to load remaining frames in the background');
      
      // Load 2 images at a time for better performance
      const loadConcurrently = 2;
      let activeLoads = 0;
      
      const loadNext = () => {
        if (loadQueueRef.current.length === 0 || activeLoads >= loadConcurrently) return;
        
        const index = loadQueueRef.current.shift();
        if (index === undefined) return;
        
        activeLoads++;
        
        const img = new Image();
        img.onload = () => {
          loadedImages.current[index] = true;
          imagesRef.current[index] = img;
          loadedCount++;
          setLoadProgress((loadedCount / totalImages) * 100);
          
          activeLoads--;
          loadNext(); // Load the next image when this one is done
        };
        
        img.onerror = () => {
          console.error(`Failed to load image ${index}`);
          activeLoads--;
          loadNext(); // Try to load the next one even if this one failed
        };
        
        img.src = images[index];
      };
      
      // Start the initial batch of loads
      for (let i = 0; i < loadConcurrently; i++) {
        loadNext();
      }
    };
    
    // Define key frames and start loading them
    const keyFrameIndices = loadKeyframesFirst();
    const remainingFrames = getRemainingFrames(keyFrameIndices);
    loadQueueRef.current = remainingFrames;
    
    console.log(`Loading ${keyFrameIndices.length} key frames first, then ${remainingFrames.length} remaining frames`);
    
    // Load key frames immediately
    keyFrameIndices.forEach(index => {
      loadImageAtIndex(index);
    });
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [images, onReady, isAndroid]);
  
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
    if (!isReady || !initialLoadCompleteRef.current || !containerRef.current) return;
    
    console.log('Setting up image sequence scrubbing');
    
    // Create a container for scrolling
    const scrollContainer = document.createElement('div');
    scrollContainer.style.height = '500vh'; // Make it 5x the viewport height for scrolling
    scrollContainer.style.position = 'absolute';
    scrollContainer.style.width = '100%';
    scrollContainer.style.top = '0';
    scrollContainer.style.zIndex = '-1';
    document.body.appendChild(scrollContainer);
    
    // Create timeline for scroll scrubbing with improved configuration
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body, // Use body as trigger to capture all scrolling
        start: "top top", 
        end: "bottom bottom",
        scrub: true, // Smooth scrubbing effect
        markers: false, // Show markers for debugging (removed for production)
        onUpdate: self => {
          // Calculate the image index based on scroll progress
          const imageIndex = Math.min(
            Math.floor(self.progress * (imagesRef.current.length - 1)),
            imagesRef.current.length - 1
          );
          
          if (imageIndex !== currentImageIndex) {
            setCurrentImageIndex(imageIndex);
            
            // Find the closest loaded image if the current one isn't loaded yet
            let closestLoadedIndex = imageIndex;
            const maxSearchDistance = 20; // Limit how far to search for an available image
            
            if (!loadedImages.current[imageIndex] || !imagesRef.current[imageIndex]) {
              // Search for the closest loaded image
              for (let distance = 1; distance <= maxSearchDistance; distance++) {
                // Try forward
                const forwardIndex = imageIndex + distance;
                if (forwardIndex < imagesRef.current.length && 
                    loadedImages.current[forwardIndex] && 
                    imagesRef.current[forwardIndex]) {
                  closestLoadedIndex = forwardIndex;
                  break;
                }
                
                // Try backward
                const backwardIndex = imageIndex - distance;
                if (backwardIndex >= 0 && 
                    loadedImages.current[backwardIndex] && 
                    imagesRef.current[backwardIndex]) {
                  closestLoadedIndex = backwardIndex;
                  break;
                }
              }
            }
            
            // Draw the closest loaded image
            if (imagesRef.current[closestLoadedIndex] && loadedImages.current[closestLoadedIndex]) {
              drawImageToCanvas(imagesRef.current[closestLoadedIndex]);
            }
            
            // Prioritize loading images near the current position
            const priorityRange = 10;
            for (let i = 1; i <= priorityRange; i++) {
              const nextIndex = imageIndex + i;
              const prevIndex = imageIndex - i;
              
              // Check if these indices are in the queue and move them to the front
              if (nextIndex < imagesRef.current.length && 
                  !loadedImages.current[nextIndex] && 
                  loadQueueRef.current.includes(nextIndex)) {
                loadQueueRef.current = loadQueueRef.current.filter(idx => idx !== nextIndex);
                loadQueueRef.current.unshift(nextIndex);
              }
              
              if (prevIndex >= 0 && 
                  !loadedImages.current[prevIndex] && 
                  loadQueueRef.current.includes(prevIndex)) {
                loadQueueRef.current = loadQueueRef.current.filter(idx => idx !== prevIndex);
                loadQueueRef.current.unshift(prevIndex);
              }
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
      if (scrollContainer && scrollContainer.parentNode) {
        document.body.removeChild(scrollContainer);
      }
    };
  }, [isReady, currentImageIndex]);

  // Add scroll-based debug info
  useEffect(() => {
    const handleScroll = () => {
      console.log('Scroll position:', window.scrollY, 'Page height:', document.body.scrollHeight);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="video-container w-full h-screen bg-black"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <Spinner />
            <p className="text-white mt-4">Loading key frames: {Math.round(loadProgress)}%</p>
            <p className="text-xs text-gray-400 mt-2">Full sequence will continue loading in background</p>
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {!isLoading && loadProgress < 100 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/50 text-white text-xs py-1 px-2 rounded-full">
            Loading full sequence: {Math.round(loadProgress)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSequenceScrubber;
