
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Constants for scroll settings
const SCROLL_EXTRA_PX = 4000;

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
  const [currentFrame, setCurrentFrame] = useState(1);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const frameRefs = useRef<HTMLImageElement[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  
  // Format frame number as 4-digit string (e.g., 0001, 0099)
  const formatFrameNumber = (num: number): string => {
    return num.toString().padStart(4, '0');
  };
  
  // Preload all frames
  useEffect(() => {
    console.log("ImageSequence - Starting to preload frames");
    let loadedCount = 0;
    const framesToLoad = totalFrames;
    
    // Clear any existing frameRefs
    frameRefs.current = [];
    
    // Notify when loading is complete
    const checkAllLoaded = () => {
      loadedCount++;
      setFramesLoaded(loadedCount);
      
      if (loadedCount === framesToLoad) {
        console.log(`ImageSequence - All ${framesToLoad} frames loaded`);
        setAllFramesLoaded(true);
        if (onReady) {
          onReady();
        }
      }
    };
    
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
          img.onload = checkAllLoaded;
          img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            checkAllLoaded(); // Count errors as loaded to avoid getting stuck
          };
          
          const frameNumber = formatFrameNumber(i);
          img.src = `${basePath}${frameNumber}.webp`;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.position = 'absolute';
          img.style.top = '0';
          img.style.left = '0';
          img.style.opacity = i === 1 ? '1' : '0'; // Show only first frame initially
          img.style.transition = 'none'; // No transition for performance
          
          // Hardware acceleration for images
          img.style.transform = 'translate3d(0,0,0)';
          img.style.backfaceVisibility = 'hidden';
          img.style.perspective = '1000px';
          img.style.willChange = 'transform, opacity';
          img.dataset.frame = i.toString();
          
          frameRefs.current.push(img);
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
      frameRefs.current = [];
    };
  }, [totalFrames, basePath, onReady]);
  
  // Setup scroll trigger once all frames are loaded
  useEffect(() => {
    if (!allFramesLoaded || !containerRef.current || !imagesContainerRef.current || isInitializedRef.current) return;
    
    // Set up container height for scrolling
    const resizeSection = () => {
      if (containerRef.current) {
        containerRef.current.style.height = `${window.innerHeight + SCROLL_EXTRA_PX}px`;
      }
    };
    
    // Update container size and attach resize listener
    resizeSection();
    window.addEventListener("resize", resizeSection);
    
    // Add frames to the container
    const imageContainer = imagesContainerRef.current;
    frameRefs.current.forEach((img) => {
      imageContainer.appendChild(img);
    });
    
    // Show the first frame initially
    if (frameRefs.current.length > 0) {
      frameRefs.current[0].style.opacity = '1';
    }
    
    // Set up the scroll trigger for frame animation
    console.log("ImageSequence - Setting up ScrollTrigger");
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: 1.2, // Smooth scrub value optimized for image sequence
      pin: true, // Pin the container during scroll
      anticipatePin: 1,
      markers: true, // For debugging - will show markers for the scroll trigger
      onUpdate: (self) => {
        // Calculate which frame to show based on scroll progress
        const progress = self.progress;
        const frameIndex = Math.min(
          Math.floor(progress * totalFrames),
          totalFrames - 1
        );
        
        // Only update if the frame has changed to minimize DOM operations
        if (frameIndex + 1 !== currentFrame) {
          console.log(`Updating to frame ${frameIndex + 1} (progress: ${progress.toFixed(2)})`);
          setCurrentFrame(frameIndex + 1);
          
          // Hide all frames and show only the current one
          frameRefs.current.forEach((img, i) => {
            img.style.opacity = i === frameIndex ? '1' : '0';
          });
          
          if (frameIndex === totalFrames - 1 || frameIndex === 0) {
            console.log(`ImageSequence - Showing frame: ${frameIndex + 1} (${progress.toFixed(2)})`);
          }
        }
      }
    });
    
    isInitializedRef.current = true;
    console.log("ImageSequence - ScrollTrigger initialized");
    
    return () => {
      // Clean up event listeners and scroll trigger
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      // Remove appended images
      frameRefs.current.forEach(img => {
        if (img.parentNode === imageContainer) {
          imageContainer.removeChild(img);
        }
      });
    };
  }, [allFramesLoaded, totalFrames, currentFrame]);
  
  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden bg-black"
    >
      {/* Dedicated container for images to ensure they're always visible */}
      <div 
        ref={imagesContainerRef} 
        className="absolute inset-0 w-full h-full z-10"
      ></div>
      
      {!allFramesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
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
