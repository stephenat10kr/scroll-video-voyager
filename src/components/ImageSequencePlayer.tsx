
import React, { useState, useEffect } from 'react';
import { useImagePathFormat } from '@/hooks/useImagePathFormat';
import { useScrollSequence } from '@/hooks/useScrollSequence';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImagePreloader } from './ImagePreloader';
import { ImageDebugInfo } from './ImageDebugInfo';
import { ImageError } from './ImageError';
import { SequenceImage } from './SequenceImage';

const TOTAL_FRAMES = 437;

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
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { workingPathFormat, findWorkingPathFormat, setWorkingPathFormat } = useImagePathFormat();
  const isMobile = useIsMobile();
  
  const getImagePath = (frameNumber: number) => {
    if (typeof workingPathFormat !== 'function') {
      console.error('workingPathFormat is not a function, using default format');
      return `/Image Sequence/${String(frameNumber).padStart(4, '0')}.webp`;
    }
    return workingPathFormat(frameNumber);
  };

  useEffect(() => {
    console.log("ImageSequencePlayer mounted, isMobile:", isMobile);
    
    const container = containerRef.current;
    if (!container) return;

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    
    resizeSection();
    window.addEventListener("resize", resizeSection);
    
    // Give mobile devices a bit more time to load initial resources
    const timeout = setTimeout(() => {
      findWorkingPathFormat();
    }, isMobile ? 500 : 0);
    
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      clearTimeout(timeout);
    };
  }, [SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, findWorkingPathFormat, isMobile]);

  useScrollSequence({
    containerRef,
    totalFrames: TOTAL_FRAMES,
    scrollExtraPx: SCROLL_EXTRA_PX,
    onProgressChange: (frameIndex) => {
      setCurrentFrame(frameIndex);
      const segLen = 1 / (segmentCount + 1);
      const progress = (frameIndex - 1) / TOTAL_FRAMES;
      
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
    },
    onScrollComplete: onAfterVideoChange,
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    console.log(`Image loaded successfully: frame ${currentFrame}`);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${getImagePath(currentFrame)}`);
    setImageError(true);
    setImageLoaded(false);
    setErrorMessage(`Unable to load frame ${currentFrame}. Please try refreshing the page.`);
  };

  const handleRefresh = () => {
    console.log("Trying to refresh with fixed path format");
    // Try a simpler path format for mobile
    const mobileOptimizedFormat = isMobile 
      ? (frame: number) => `Image Sequence/${String(frame).padStart(4, '0')}.webp`
      : (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`;
    
    setWorkingPathFormat(() => mobileOptimizedFormat);
    setImageError(false);
    setErrorMessage(null);
    setImageLoaded(false);
    
    // Try again with optimized format
    setTimeout(() => findWorkingPathFormat(), 300);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {errorMessage ? (
          <ImageError message={errorMessage} onRefresh={handleRefresh} />
        ) : (
          <>
            <SequenceImage
              currentFrame={currentFrame}
              getImagePath={getImagePath}
              onLoad={handleImageLoad}
              onError={handleImageError}
              imageLoaded={imageLoaded}
            />
            
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
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
