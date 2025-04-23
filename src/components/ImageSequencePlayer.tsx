
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
  const toast = useToast();
  
  // Generate the correct image path
  const getImagePath = (frameNumber: number) => {
    // Format the frame number with leading zeros
    const paddedNumber = frameNumber.toString().padStart(4, '0');
    // Return the path to the image in the Image Sequence directory
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
    const totalFrames = 437; // Total number of frames in the sequence (from 0001.webp to 0437.webp)

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

  // Test a sample image to verify the path is correct
  useEffect(() => {
    const testImage = new Image();
    const testPath = getImagePath(1);
    console.log("Testing image path:", testPath);
    
    testImage.onload = () => {
      console.log(`Test image ${testPath} loaded successfully!`);
      setErrorMessage(null);
    };
    
    testImage.onerror = () => {
      console.error(`Test image ${testPath} failed to load`);
      setErrorMessage(`Failed to load test image. Please check your path: ${testPath}`);
      
      // Try alternative paths as a fallback
      const alternativePaths = [
        `/Image%20Sequence/0001.webp`,
        `/Image Sequence/0001.webp`,
        `./Image%20Sequence/0001.webp`,
        `./Image Sequence/0001.webp`,
        `/public/Image%20Sequence/0001.webp`,
        `/public/Image Sequence/0001.webp`
      ];
      
      let loadedAny = false;
      alternativePaths.forEach(path => {
        const altImage = new Image();
        altImage.onload = () => {
          console.log(`Alternative path worked: ${path}`);
          loadedAny = true;
        };
        altImage.onerror = () => console.error(`Failed with alternative path: ${path}`);
        altImage.src = path;
      });
    };
    
    testImage.src = testPath;
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    console.log(`Image ${currentFrame} loaded successfully!`);
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error event
  const handleImageError = () => {
    console.error(`Image ${currentFrame} failed to load`);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {errorMessage ? (
          <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
            <div className="bg-red-800/80 p-4 rounded-lg max-w-md">
              <h3 className="text-xl font-bold mb-2">Image Loading Error</h3>
              <p>{errorMessage}</p>
            </div>
          </div>
        ) : (
          <img
            key={currentFrame} // Key changes will force re-render when frame changes
            src={getImagePath(currentFrame)}
            alt={`Frame ${currentFrame}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Display debugging info */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>Current Frame: {currentFrame}</div>
          <div>Image Path: {getImagePath(currentFrame)}</div>
          <div>Status: {imageLoaded ? "Loaded ✅" : imageError ? "Error ❌" : "Loading..."}</div>
          <div>Origin: {window.location.origin}</div>
          <div>Pathname: {window.location.pathname}</div>
          <div className="mt-2 text-xs opacity-70">
            Using URL encoded path: /Image%20Sequence/
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
