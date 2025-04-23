
import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '@/hooks/use-toast';
import { useImagePathFormat } from '@/hooks/useImagePathFormat';
import { ImagePreloader } from './ImagePreloader';
import { ImageDebugInfo } from './ImageDebugInfo';
import { ImageError } from './ImageError';

gsap.registerPlugin(ScrollTrigger);

type ImageSequencePlayerProps = {
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
};

const TOTAL_FRAMES = 437;

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
  const { workingPathFormat, findWorkingPathFormat, setWorkingPathFormat } = useImagePathFormat();
  
  const getImagePath = (frameNumber: number) => {
    if (typeof workingPathFormat !== 'function') {
      console.error('workingPathFormat is not a function, using default format');
      return `/Image Sequence/${String(frameNumber).padStart(4, '0')}.webp`;
    }
    return workingPathFormat(frameNumber);
  };

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

    const segLen = 1 / (segmentCount + 1);

    const updateScroll = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < 0.01) return;
      
      lastProgressRef.current = progress;
      const frameIndex = Math.min(Math.floor(progress * TOTAL_FRAMES) + 1, TOTAL_FRAMES);
      setCurrentFrame(frameIndex);

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
    
    findWorkingPathFormat();
    
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange, findWorkingPathFormat]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${getImagePath(currentFrame)}`);
    setImageError(true);
    setImageLoaded(false);
    setErrorMessage("Unable to load this frame. Please try refreshing the page.");
  };

  const handleRefresh = () => {
    setWorkingPathFormat(() => (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`);
    setImageError(false);
    setErrorMessage(null);
    setImageLoaded(false);
    findWorkingPathFormat();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {errorMessage ? (
          <ImageError message={errorMessage} onRefresh={handleRefresh} />
        ) : (
          <>
            <img
              key={`frame-${currentFrame}`}
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
            
            <ImagePreloader
              currentFrame={currentFrame}
              getImagePath={getImagePath}
              totalFrames={TOTAL_FRAMES}
            />
          </>
        )}
        
        <ImageDebugInfo
          currentFrame={currentFrame}
          workingPathFormat={workingPathFormat}
          imageLoaded={imageLoaded}
          imageError={imageError}
        />
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
