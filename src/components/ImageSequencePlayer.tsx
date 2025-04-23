
import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '@/hooks/use-toast';

gsap.registerPlugin(ScrollTrigger);

type ImageSequencePlayerProps = {
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
};

const ImageSequencePlayer: React.FC<ImageSequencePlayerProps> = ({
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Generate image paths with different encodings to try
  const getImagePaths = (frameNumber: number) => {
    // Format the frame number with leading zeros
    const paddedNumber = frameNumber.toString().padStart(4, '0');
    
    // Return multiple path options to try
    return [
      `/Image%20Sequence/${paddedNumber}.webp`,
      `/Image Sequence/${paddedNumber}.webp`,
      `./Image%20Sequence/${paddedNumber}.webp`,
      `./Image Sequence/${paddedNumber}.webp`
    ];
  };
  
  // Main function to get the best image path
  const getImagePath = (frameNumber: number) => {
    const paddedNumber = frameNumber.toString().padStart(4, '0');
    return `/Image%20Sequence/${paddedNumber}.webp`;
  };
  
  useEffect(() => {
    console.log("ImageSequencePlayer mounted");
    console.log("Current image path being tested:", getImagePath(1));
    
    const container = containerRef.current;
    if (!container) {
      console.error("Container ref is null");
      return;
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const segLen = 1 / (segmentCount + 1);
    const totalFrames = 437; // Total number of frames in the sequence

    const updateScroll = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < 0.01) {
        return;
      }
      lastProgressRef.current = progress;

      // Calculate the current frame based on scroll progress
      const frameIndex = Math.min(Math.floor(progress * totalFrames) + 1, totalFrames);
      setCurrentFrame(frameIndex);

      // Just update text indices based on scroll
      let textIdx: number | null = null;
      for (let i = 0; i < segmentCount; ++i) {
        if (progress >= segLen * i && progress < segLen * (i + 1)) {
          textIdx = i;
          break;
        }
      }
      if (progress >= segLen * segmentCount) {
        textIdx = null;
      }
      onTextIndexChange(textIdx);
      onAfterVideoChange(progress >= 1);
    };

    console.log("Creating ScrollTrigger in ImageSequencePlayer");
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: 0.1,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) {
          console.warn("Progress is NaN");
          return;
        }
        updateScroll(progress);
      }
    });

    console.log("ScrollTrigger created in ImageSequencePlayer");
    
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange]);

  // Test images with all possible paths to ensure we find a working one
  useEffect(() => {
    // Try the first frame with multiple path options to find one that works
    const testPaths = getImagePaths(1);
    let foundWorkingPath = false;
    
    // Function to test an image path
    const testImagePath = (path: string, index: number) => {
      const testImage = new Image();
      testImage.onload = () => {
        if (!foundWorkingPath) {
          console.log(`Success: Image loaded with path: ${path}`);
          foundWorkingPath = true;
          setImageError(false);
          setErrorMessage(null);
          
          // Show success toast only for the first successful load
          toast({
            title: "Images Loaded",
            description: "Image sequence is ready for scrolling",
          });
        }
      };
      
      testImage.onerror = () => {
        console.error(`Failed to load test image with path: ${path}`);
        // If this is the last path we tried and none worked
        if (index === testPaths.length - 1 && !foundWorkingPath) {
          setErrorMessage(`Unable to load images. Please check your internet connection and try again.`);
          setImageError(true);
          
          toast({
            title: "Image Loading Error",
            description: "Failed to load image sequence. Check console for details.",
            variant: "destructive",
          });
        }
      };
      
      testImage.src = path;
    };
    
    // Try each path option
    testPaths.forEach(testImagePath);
    
    // Prefetch next few frames for smoother experience
    const prefetchNext = (baseFrame: number, count: number) => {
      for (let i = 1; i <= count; i++) {
        const frame = baseFrame + i;
        if (frame <= 437) { // Don't exceed max frames
          const img = new Image();
          img.src = getImagePath(frame);
        }
      }
    };
    
    // Prefetch first 5 frames
    prefetchNext(1, 5);
    
  }, [toast]);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error event
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    
    // Try alternative paths if primary fails
    const paths = getImagePaths(currentFrame);
    let loaded = false;
    
    // Try each alternative path
    paths.slice(1).forEach(path => {
      if (!loaded) {
        const altImg = new Image();
        altImg.onload = () => {
          if (!loaded) {
            loaded = true;
            setImageLoaded(true);
            setImageError(false);
            
            // Force a re-render by updating state
            setCurrentFrame(prev => prev);
          }
        };
        altImg.src = path;
      }
    });
  };

  // Create an array of image elements for preloading next/previous frames
  const createPreloadImages = () => {
    const preloadFrames = [];
    // Preload next 3 frames and previous 1 frame
    for (let i = -1; i <= 3; i++) {
      if (i === 0) continue; // Skip current frame
      
      const frameNum = currentFrame + i;
      if (frameNum >= 1 && frameNum <= 437) {
        preloadFrames.push(
          <img 
            key={`preload-${frameNum}`}
            src={getImagePath(frameNum)}
            alt=""
            className="hidden"
            aria-hidden="true"
          />
        );
      }
    }
    return preloadFrames;
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {errorMessage ? (
          <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
            <div className="bg-black/80 p-6 rounded-lg max-w-md">
              <h3 className="text-xl font-bold mb-4">Image Loading Error</h3>
              <p className="mb-4">{errorMessage}</p>
              <button 
                className="px-4 py-2 bg-white text-black rounded-md font-medium"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        ) : (
          <>
            <img
              key={currentFrame} // Key changes will force re-render when frame changes
              src={getImagePath(currentFrame)}
              alt={`Frame ${currentFrame}`}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
            
            {/* Preload adjacent frames for smoother scrolling */}
            <div aria-hidden="true" className="sr-only">
              {createPreloadImages()}
            </div>
          </>
        )}
        
        {/* Display debugging info in development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
            <div>Current Frame: {currentFrame}</div>
            <div>Image Path: {getImagePath(currentFrame)}</div>
            <div>Status: {imageLoaded ? "Loaded ✅" : imageError ? "Error ❌" : "Loading..."}</div>
            <div>Origin: {window.location.origin}</div>
            <div>Pathname: {window.location.pathname}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
