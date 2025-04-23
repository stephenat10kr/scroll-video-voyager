
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

// Define default image paths without requiring toString() on potentially null values
const IMAGE_PATH_FORMATS = [
  (frame: number) => `/Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `./Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `./Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image-Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image Sequence/${String(frame).padStart(4, '0')}.webp`
];

// Default format to use before finding the working one
const DEFAULT_FORMAT = IMAGE_PATH_FORMATS[0];

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
  // Initialize with default format function to avoid null errors
  const [workingPathFormat, setWorkingPathFormat] = useState<(frame: number) => string>(DEFAULT_FORMAT);
  const { toast } = useToast();
  const totalFrames = 437; // Total number of frames in the sequence
  
  // Function to get the best image path based on what has worked previously
  const getImagePath = (frameNumber: number) => {
    // Always use a valid function, even if it's the default one
    return workingPathFormat(frameNumber);
  };

  // Function to test all path formats to find one that works
  const findWorkingPathFormat = (callback?: () => void) => {
    let foundWorkingFormat = false;
    let formatIndex = 0;
    
    // Function to test the next format
    const testNextFormat = () => {
      if (formatIndex >= IMAGE_PATH_FORMATS.length) {
        if (!foundWorkingFormat) {
          setErrorMessage("Unable to load images. Please check your internet connection and try again.");
          setImageError(true);
          toast({
            title: "Image Loading Error",
            description: "Failed to load image sequence. Please try refreshing the page.",
            variant: "destructive",
          });
        }
        return;
      }
      
      const format = IMAGE_PATH_FORMATS[formatIndex];
      const path = format(1); // Test with first frame
      
      const testImage = new Image();
      testImage.onload = () => {
        console.log(`Success: Image loaded with path format ${formatIndex}: ${path}`);
        foundWorkingFormat = true;
        setWorkingPathFormat(format);
        setImageError(false);
        setErrorMessage(null);
        setImageLoaded(true);
        
        toast({
          title: "Images Loaded",
          description: "Image sequence is ready for scrolling",
        });
        
        if (callback) callback();
        
        // Prefetch first few frames for smoother experience
        for (let i = 2; i <= 5; i++) {
          const img = new Image();
          img.src = format(i);
        }
      };
      
      testImage.onerror = () => {
        console.error(`Failed to load test image with format ${formatIndex}: ${path}`);
        formatIndex++;
        // Try next format
        testNextFormat();
      };
      
      testImage.src = path;
    };
    
    // Start testing formats
    testNextFormat();
  };
  
  // Initialize the scroll trigger and test image paths
  useEffect(() => {
    console.log("ImageSequencePlayer mounted");
    
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

    // Set up scroll trigger
    const segLen = 1 / (segmentCount + 1);

    const updateScroll = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < 0.01) {
        return;
      }
      lastProgressRef.current = progress;

      // Calculate the current frame based on scroll progress
      const frameIndex = Math.min(Math.floor(progress * totalFrames) + 1, totalFrames);
      setCurrentFrame(frameIndex);

      // Update text indices based on scroll
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
    
    // Find a working image path format
    findWorkingPathFormat();
    
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange, toast]);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error event and try to recover
  const handleImageError = () => {
    console.error(`Failed to load image: ${getImagePath(currentFrame)}`);
    
    // Try all formats for this specific frame
    let tried = 0;
    const tryNextFormat = () => {
      if (tried >= IMAGE_PATH_FORMATS.length) {
        setImageError(true);
        setImageLoaded(false);
        setErrorMessage("Unable to load this frame. Please try refreshing the page.");
        return;
      }
      
      const format = IMAGE_PATH_FORMATS[tried];
      const path = format(currentFrame);
      
      const retryImg = new Image();
      retryImg.onload = () => {
        console.log(`Recovery success: Loaded frame ${currentFrame} with format ${tried}`);
        setWorkingPathFormat(format);
        setImageError(false);
        setErrorMessage(null);
        setImageLoaded(true);
        // Force re-render with new path
        setCurrentFrame(prev => prev);
      };
      
      retryImg.onerror = () => {
        tried++;
        tryNextFormat();
      };
      
      retryImg.src = path;
    };
    
    tryNextFormat();
  };

  // Handle manual refresh
  const handleRefresh = () => {
    // Always set to a valid function before attempting to find a new one
    setWorkingPathFormat(DEFAULT_FORMAT);
    setImageError(false);
    setErrorMessage(null);
    setImageLoaded(false);
    
    // Try to find a working path format again
    findWorkingPathFormat(() => {
      // Force re-render after finding format
      setCurrentFrame(1);
    });
    
    // Show toast for better UX
    toast({
      title: "Refreshing",
      description: "Attempting to reload image sequence...",
    });
  };

  // Create an array of image elements for preloading adjacent frames
  const createPreloadImages = () => {
    // Never call preload if workingPathFormat is not a function
    const preloadFrames = [];
    // Preload next 3 frames and previous 1 frame
    for (let i = -1; i <= 3; i++) {
      if (i === 0) continue; // Skip current frame
      
      const frameNum = currentFrame + i;
      if (frameNum >= 1 && frameNum <= totalFrames) {
        preloadFrames.push(
          <img 
            key={`preload-${frameNum}`}
            src={workingPathFormat(frameNum)}
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
                className="px-4 py-2 bg-white text-black rounded-md font-medium flex items-center justify-center mx-auto"
                onClick={handleRefresh}
              >
                <span className="mr-2">Refresh</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.168 8A10.003 10.003 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c4.4 0 8.14-2.833 9.5-6.78" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8h5.4V2.6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <img
              key={`frame-${currentFrame}`} // Key changes will force re-render when frame changes
              src={getImagePath(currentFrame)}
              alt={`Frame ${currentFrame}`}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
            
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
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
            <div>Path Format Index: {IMAGE_PATH_FORMATS.indexOf(workingPathFormat)}</div>
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
